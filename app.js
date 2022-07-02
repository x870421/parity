let data = [];

//讀取數據
function getData() {
  axios
    .get("https://hexschool.github.io/js-filter-data/data.json")
    .then(function (response) {
      data = response.data.filter(
        (item) => item["種類代碼"] && item["作物名稱"].trim()
      );
      data = data.filter((item) => item["交易量"] !== 0);
    })
    .catch((err) => {
      console.log(err);
    });
}
getData();

//渲染畫面
const showList = document.querySelector(".showList");
function randerData(data) {
  let str = "";
  data.forEach((value, index) => {
    str += `
      <tr> <td class="fw-bold"> ${value["作物名稱"]} </td>
        <td class="fw-bold">${value["市場名稱"]}</td>
        <td>${value["上價"]}</td>
        <td>${value["中價"]}</td>
        <td>${value["下價"]}</td>
        <td>${value["平均價"]}</td>
        <td>${value["交易量"]}</td> </tr>`;
  });
  showList.innerHTML = str;

  goPage(1, setPageSize);
}
//設定種類
let type = "";
const navbt = document.querySelector(".button-group");

navbt.addEventListener("click", (e) => {
  if (e.target.nodeName == "BUTTON") {
    type = e.target.dataset.type;
  }

  const faActive = document.querySelector(".fa-active");
  if (faActive !== null) {
    faActive.classList.remove("fa-active");
  }
  updateData();
  search();
});

//切換頁面active
$(".button-group button").click(function (e) {
  $(this).siblings().removeClass("active");
  $(this).addClass("active");
});

//切換資料庫更新
let newData = [];
function updateData() {
  if (type == "N04") {
    newData = data.filter((item) => item["種類代碼"] === "N04");
  } else if (type == "N05") {
    newData = data.filter((item) => item["種類代碼"] === "N05");
  } else if (type == "N06") {
    newData = data.filter((item) => item["種類代碼"] === "N06");
  } else if (type == "all") {
    newData = data;
  }

  sortSelect.value = "排序篩選";
  randerData(newData);
}

//搜尋畫面

const cropInput = document.querySelector(".crop-input input");
const searchbt = document.querySelector(".search");
const cropName = document.querySelector("#js-crop-name");
function search() {
  let searchText = `查看 「${cropInput.value}」的查詢結果`;
  cropName.textContent = searchText;

  if (type === "all" || type === "") {
    newData = data.filter((item) => item["作物名稱"].match(cropInput.value));
  } else if (type === "N04" || type == "N05" || type == "N06") {
    newData = newData.filter((item) => item["作物名稱"].match(cropInput.value));
  }

  if (newData.length == 0) {
    str = `<tr>
    <td colspan="7" class="text-center p-3">
      抱歉!此分類查無此品項O＿O
    </td>
  </tr>`;
    showList.innerHTML = str;

    return;
  }

  randerData(newData);
}

searchbt.addEventListener("click", () => {
  if (cropInput.value === "") {
    alert("請輸入作物名稱");
    return;
  }
  search();
});

//排序
const sortAdvanced = document.querySelector(".js-sort-advanced ");
let sortPrice = ""; //價格種類
let sortType = ""; //大到小 或 小到大
sortAdvanced.addEventListener("click", (e) => {
  //先搜尋後排序
  if (type == "") {
    alert("請先搜尋!");
    return;
  }

  if (e.target.nodeName == "TH") {
    return;
  }

  //排序function

  function sorted() {
    if (sortType === "up") {
      newData = newData.sort((a, b) => {
        return b[sortPrice] - a[sortPrice];
      });
    } else {
      newData = newData.sort((a, b) => {
        return a[sortPrice] - b[sortPrice];
      });
    }
  }

  const faActive = document.querySelector(".fa-active");
  if (faActive !== null) {
    faActive.classList.remove("fa-active");
  }
  //點擊字體有反應
  if (e.target.nodeName == "DIV") {
    if (sortPrice == e.target.textContent.trim()) {
      if (sortType == "up") {
        sortType = "down";
        e.target.children[0].children[1].classList.add("fa-active");
      } else if (sortType == "down") {
        e.target.children[0].children[0].classList.add("fa-active");
        sortType = "up";
      }
    } else {
      e.target.children[0].children[0].classList.add("fa-active");
      sortPrice = e.target.textContent.trim();
      sortType = "up";
    }
  }
  //點擊上下符號有反應
  else if (e.target.nodeName == "I") {
    e.target.classList.add("fa-active");

    sortPrice = e.target.dataset.price;
    sortType = e.target.dataset.sort;
  }

  sorted();

  let sorttext = `依${sortPrice}排序`;
  sortSelect.value = sorttext;
  randerData(newData);
});

//option 大到小排序
const sortSelect = document.querySelector(".sort-select");
sortSelect.addEventListener("change", (e) => {
  if (type == "") {
    return;
  }

  sortPrice = e.target.selectedOptions[0].dataset.price;
  newData = newData.sort((a, b) => {
    return b[sortPrice] - a[sortPrice];
  });
  randerData(newData);
});

//自動搜尋 (keyup電腦打字搜尋,enter手機換行搜尋)

["keyup", "enter"].forEach((item) => {
  cropInput.addEventListener(item, (e) => {
    search();
  });
});

//page

const setPageSize = 20; //設定每頁顯示幾筆

$(function () {
  /*----產生data-th-----*/
  let $table = $(".table_change");
  let $thRows = $table.find("thead th");

  $thRows.each(function (key, thRow) {
    $table
      .find("tbody tr td:nth-child(" + (key + 1) + ")")
      .attr("data-th", $(thRow).text());
  });
  /*-----------*/
  goPage(1, setPageSize); // 一開始先秀第一頁,以及每一頁最多兩筆資料
});

function goPage(currentPage, pageSize) {
  var tr = $(".table_change tbody tr");
  var num = $(".table_change tbody tr").length; //表格所有行數(所有記錄數)
  var totalPage = Math.ceil(num / pageSize); // 表格所有行數/每頁顯示行數 = 總頁數

  var startRow = (currentPage - 1) * pageSize + 1; //開始顯示的行
  var endRow = currentPage * pageSize; //結束顯示的行
  endRow = endRow > num ? num : endRow;

  //遍歷顯示資料實現分頁
  for (var i = 1; i < num + 1; i++) {
    var trRow = tr[i - 1];
    if (i >= startRow && i <= endRow) {
      trRow.style.display = "";
    } else {
      trRow.style.display = "none";
    }
  }

  //bootstrap分頁

  currentPage = parseInt(currentPage);
  const pagination = document.querySelector(".pagination");
  //上一頁的標籤

  let pagestr = "";
  if (currentPage == 1) {
    pagestr += `<li class="page-item">
    <a class="page-link" aria-label="Previous" >
      <span aria-hidden="true" >&laquo;</span>
    </a>
  </li>
  <li class="page-item"><a class="page-link"  onClick="goPage(1,setPageSize)" >1</a></li>
  `;
  } else {
    pagestr += `<li class="page-item">
    <a class="page-link" aria-label="Previous" onClick="goPage(${
      currentPage - 1
    },setPageSize)">
      <span aria-hidden="true" >&laquo;</span>
    </a>
  </li>
  <li class="page-item"><a  class="page-link"  onClick="goPage(1,setPageSize)"> 1</a></li>
  `;
  }
  //中間標籤
  if (currentPage <= 4) {
    if (totalPage <= 5) {
      for (i = 2; i <= totalPage; i++) {
        pagestr += `<li class="page-item"><a class="page-link" onClick="goPage(${i},setPageSize)">${i}</a></li>`;
      }
    } else if (totalPage > 5) {
      for (i = 2; i <= 5; i++) {
        pagestr += `<li class="page-item"><a class="page-link" onClick="goPage(${i},setPageSize)">${i}</a></li>`;
      }
      pagestr += `<li class="page-item"><a class="page-link"  onClick="goPage(${i},setPageSize)">...</a></li><li class="page-item"><a class="page-link" onClick="goPage(${totalPage},setPageSize)">${totalPage}</a></li>`;
    }
  } else if (currentPage < totalPage - 3) {
    pagestr += `<li class="page-item"><a class="page-link">...</a></li>`;
    if (totalPage <= currentPage + 2) {
      for (i = currentPage - 1; i <= totalPage; i++) {
        pagestr += `<li class="page-item"><a class="page-link" onClick="goPage(${i},setPageSize)">${i}</a></li>`;
      }
    } else if (totalPage > currentPage + 2) {
      for (i = currentPage - 1; i <= currentPage + 1; i++) {
        pagestr += `<li class="page-item"><a class="page-link" onClick="goPage(${i},setPageSize)">${i}</a></li>`;
      }
      pagestr += `<li class="page-item"><a class="page-link">...</a></li><li class="page-item"><a class="page-link" onClick="goPage(${totalPage},setPageSize)">${totalPage}</a></li>`;
    }
  } else if (currentPage >= totalPage - 3) {
    pagestr += `<li class="page-item"><a class="page-link">...</a></li>`;

    if (totalPage < currentPage) {
      for (i = currentPage - 1; i <= totalPage; i++) {
        pagestr += `<li class="page-item"><a class="page-link" onClick="goPage(${i},setPageSize)">${i}</a></li>`;
      }
    } else if (totalPage >= currentPage - 2) {
      for (i = totalPage - 3; i <= totalPage; i++) {
        pagestr += `<li class="page-item"><a class="page-link" onClick="goPage(${i},setPageSize)">${i}</a></li>`;
      }
    }
  }

  //下一頁的標籤

  if (currentPage == totalPage) {
    pagestr += `
  <li class="page-item">
  <a class="page-link" aria-label="Next"  >
    <span aria-hidden="true">&raquo;</span>
  </a>
</li>`;
  } else {
    pagestr += `
  <li class="page-item">
  <a class="page-link" aria-label="Next" onClick="goPage(${
    currentPage + 1
  },setPageSize)" >
    <span aria-hidden="true">&raquo;</span>
  </a>
</li>`;
  }

  pagination.innerHTML = pagestr;

  for (i = 1; i <= totalPage; i++) {
    if (pagination.children[i].children[0].text == currentPage) {
      pagination.children[i].children[0].classList.add("active");
      return;
    }
  }
}

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
      <tr> <td> ${value["作物名稱"]} </td>
        <td>${value["市場名稱"]}</td>
        <td>${value["上價"]}</td>
        <td>${value["中價"]}</td>
        <td>${value["下價"]}</td>
        <td>${value["平均價"]}</td>
        <td>${value["交易量"]}</td> </tr>`;
  });
  showList.innerHTML = str;
}
//設定種類
let type = "all";
const navbt = document.querySelector(".button-group");
navbt.addEventListener("click", (e) => {
  if (type !== e.target.dataset.type) {
    if (e.target.nodeName == "BUTTON") {
      type = e.target.dataset.type;
    }
  } else if (type === e.target.dataset.type) {
    type = "all";
  }

  updateData();
  search();
});

//切換頁面active
$(".button-group button").click(function (e) {
  $(this).siblings().removeClass("active");
  $(this).toggleClass("active");
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
  }

  randerData(newData);
}

//搜尋畫面

const cropInput = document.querySelector(".crop-input input");
const searchbt = document.querySelector(".search");
const cropName = document.querySelector("#js-crop-name");
function search() {
  let searchText = `查看 「${cropInput.value}」的查詢結果`;
  cropName.textContent = searchText;

  if (type === "all") {
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

//option 大到小排序
const sortSelect = document.querySelector(".sort-select");
sortSelect.addEventListener("change", (e) => {
  let SortType = e.target.selectedOptions[0].dataset.price;

  newData = newData.sort((a, b) => {
    return b[SortType] - a[SortType];
  });
  randerData(newData);
});

//排序
const sortAdvanced = document.querySelector(".js-sort-advanced");

sortAdvanced.addEventListener("click", (e) => {
  if (e.target.nodeName == "I") {
    let SortType = e.target.dataset.price;

    if (type == "all") {
      if (e.target.dataset.sort === "up") {
        newData = data.sort((a, b) => {
          return b[SortType] - a[SortType];
        });
      } else {
        newData = data.sort((a, b) => {
          return a[SortType] - b[SortType];
        });
      }
    } else {
      if (e.target.dataset.sort === "up") {
        newData = newData.sort((a, b) => {
          return b[SortType] - a[SortType];
        });
      } else {
        newData = newData.sort((a, b) => {
          return a[SortType] - b[SortType];
        });
      }
    }

    let sorttext = `依${SortType}排序`;
    sortSelect.value = sorttext;
    randerData(newData);
  }
});

//自動搜尋
cropInput.addEventListener("keyup", (e) => {
  search();
});

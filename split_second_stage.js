function init_second_stage_split(){
  $('#best_split').on('click', function(){
    get_all_user_data()
  })
}
function get_all_user_data(){
  var all_user = get_user_data();
  var all_net_worth = [];
  // var user_cost_list = []
  all_user.forEach((user, i) => {
    all_user[i].net_worth = cost_minus_give_cost(user) // 算出已付應付之間的差
    all_net_worth.push(cost_minus_give_cost(user))    // 準備排序陣列

  });
  sessionStorage.setItem('user_arr', JSON.stringify(all_user))
  // console.log('帶有淨值的使用者:', all_user);
  
  
  all_user
  
  // 排序最多cost的人
  var result_sort = simpleMergeSort(all_net_worth)
  console.log('排序最多淨值的人:', result_sort,);

  // 反推出排序過的陣列
  var user_cost_list_sort = reverse_mony_to_id(result_sort)
  console.log('排序過淨值的使用者:', user_cost_list_sort);
}


function reverse_mony_to_id(formThisArr) {
  var all_user = get_user_data();
  var all_user_sort = [];
  formThisArr.forEach((item, i)=>{
    all_user.forEach((user, user_index)=>{
      if(item == user.net_worth){
        all_user_sort[i] = user
        }
      })
  })
  return all_user_sort

}

// 採用合併排序法
const simpleMergeSort = (arr) => {

  // 合併
  const merge = (leftArray, rightArray) => {
    let result = [];
    let nowIndex = 0, left = 0, right = 0;
    const leftLength = leftArray.length;
    const rightLength = rightArray.length;

    // 如果左右兩邊都沒抓完，就看誰比較小抓誰
    while (left < leftLength && right < rightLength) {
      if (leftArray[left] < rightArray[right]) {
        result[nowIndex++] = leftArray[left++];
      } else {
        result[nowIndex++] = rightArray[right++];
      }
    }

    // 跑到這裡代表左右兩邊其中一邊抓完了
    // 如果是左邊沒抓完，全部抓下來
    while (left < leftLength) {
      result[nowIndex++] = leftArray[left++];
    }

    // 右邊沒抓完，全部抓下來
    while (right < rightLength) {
      result[nowIndex++] = rightArray[right++];
    }

    // 把合併好的陣列直接傳回去
    return result;
  }
  const _mergeSort = (arr) => {
    const length = arr.length;
    if (length <= 1) return arr;

    // 切兩半
    const middle = Math.floor(length / 2);

    // 排左邊
    const leftArray = _mergeSort(arr.slice(0, middle));

    // 排右邊
    const rightArray = _mergeSort(arr.slice(middle, length));

    // 合併後丟回去
    return merge(leftArray, rightArray);
  }
  return _mergeSort(arr);
}

// 算出每人付出的錢與應付金額的差
function cost_minus_give_cost(ofThisUser){
  var total_amount = ofThisUser.cost;                    // 使用者已經出的錢
  ofThisUser.give_someone.forEach(amount=>{              // 使用者應該要出的錢
    total_amount -= amount.give_cost
  })
  return total_amount;
}
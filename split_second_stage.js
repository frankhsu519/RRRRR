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

  // 排序最多cost的人
  var result_sort = simpleMergeSort(all_net_worth)
  // console.log('排序最多淨值的人:', result_sort);

  // 反推出排序過的陣列
  var user_cost_list_sort = reverse_mony_to_id(result_sort)
  // console.log('排序過淨值的使用者:', user_cost_list_sort);

  sort_net_worth(user_cost_list_sort)

}

// 判定每個人需要多付錢還是被付錢
function sort_net_worth(fromThisArr){
  var creditor = []   // 債權人
  var debtor = []     // 債務人
  var pay_off_user = []  // 無須付款或收錢
  fromThisArr.forEach(user=>{
    if(user.net_worth < 0) {
      debtor.push(user)
    } else if (user.net_worth > 0){
      creditor.push(user)
    } else {
      pay_off_user.push(user)
    }
  })

  // console.log('債權人:', creditor, '債務人:', debtor);

  // 將所有債權人的債權集中到最大債權人身上
  transe_credit({creditor, debtor, pay_off_user})

  // 將債務人的錢轉給債權人
  // debtor.forEach(deb_user=>{
  //   creditor.forEach(cre_user=>{
  //     deb_user.net_worth

  //    })
  // })

}

function transe_credit(accordingTheseData){
  var creditor = accordingTheseData.creditor;
  var debtor = accordingTheseData.debtor;
  var pay_off_user = accordingTheseData.pay_off_user;
  var all_user_sort = [...debtor, ...pay_off_user, ...creditor];
  console.log('排序後的所有人:', all_user_sort, all_user_sort.length -1);
  // debugger

  // 排序債權人
  var creditor_list = []
  creditor.forEach(credit=>{
    creditor_list.push(credit.net_worth)
  })
  var creditor_list_sort = simpleMergeSort(creditor_list)
  // console.log('排序後的債權:', creditor_list_sort, '最大債權人債權:', creditor_list_sort[creditor_list_sort.length-1]);
  // console.log('排序後的債權人:', creditor, '最大債權人', creditor[creditor.length-1]);
  // console.log('債權人:', creditor ,'債務人:',  debtor)
  
  // 把最大債權人以外的債權都轉移給最大債權人
  // var biggest_creditor = creditor[creditor.length-1]
  var biggest_creditor_id = creditor[creditor.length-1].id  // 最大債權人id 


  for(var i=0; i<all_user_sort.length-2; i++){
    // 每個人都把自己的give_someone 加給最大債權人
    all_user_sort[i].give_someone.forEach(each_give_someone=>{
      console.log('個別的give_some',each_give_someone);
    })
  }
  



  // for(var i = creditor.length-2; i<0; i--){
  //   // 債權轉移
  //   creditor[creditor.length-1] += creditor_list[i].net_worth; // 最大債權人的債權增加金額

  //   creditor[creditor.length-1].give_someone.forEach(give_someone=>{
  //     if(give_someone.user_id == creditor_list[i].id) {             
  //       give_someone.give_cost += creditor_list[i].give_cost;
  //       creditor_list[i].give_cost = 0
        
  //       // 最大債權人渲染資料庫新增債務  金額等同債權增加的金額
        
  //       // 轉移後該人其他比金額
  //       give_someone.give_cost += creditor_list[i].net_worth        // 最大債權人對該人的債務增加相等金額
  //       creditor_list[i].net_worth = 0                              // 轉移後該人淨值歸零
  //     }
  //   })
    
    
  // }

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
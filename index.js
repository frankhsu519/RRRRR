
$(document).ready(function(){
    sessionStorage.setItem("user_arr", "[]");
    sessionStorage.setItem("user_count", "0");
    sessionStorage.setItem("cost_total", "0");
    sessionStorage.setItem("cost_list","[]");
    sessionStorage.setItem("cost_list_count", "0");

    var user_count = Number(sessionStorage.getItem("user_count"));
    var cost_list_count = Number(sessionStorage.getItem("cost_list_count"));

    // 新增user
    $('#add_user').click(function(){
        add_user()
    })
    $('#user_name').on('keypress', function(e){
        if (e.keyCode == 13) {
            add_user()
        }
    })

    // 新增項目
    add_item(cost_list_count)

    // 結帳
    checkout()
    show_checkout_detail()
    
    // 全選
    switch_all()

    // unlock checkout
    unlock_checkout()

    set_user_split_by_memte_select()

    // 註冊分享事件
    $('#share_btn').on('click', share)

    // 註冊二階段分帳
    init_second_stage_split()

    // 取得紀錄資料
    window.first_render = true;
    if(window.location.href.split('record_data=').length>1) {
        get_record_data()      // 取得網址參數
        // 自動跑一般/最佳化分帳
        var record_data = decode_data();
        if(record_data.type == 'best'){
            get_all_user_data()
        } else {
            checkout_funciton()
        }

    }
    window.first_render = false
    bambuger_triger()

})

function decode_data(){
    var url = window.location.href.split('record_data=')[1]
    var remove_quertion_mark = url.replace('?', '');
    // console.log('getdecode:', unescape(decodeURI(remove_quertion_mark)));
    var record_data = JSON.parse(unescape(decodeURI(remove_quertion_mark)))
    // console.log(record_data, JSON.stringify(record_data.user_data));
    return record_data;
}

function get_record_data(){
    var record_data = decode_data();

    if(record_data.user_data.length > 0){
        sessionStorage.setItem("user_arr", JSON.stringify(record_data.user_data));
        render_by_record(record_data.user_data)
    }

    if(JSON.parse(record_data.cost_list).length >0){
        sessionStorage.setItem("cost_list", record_data.cost_list);
        sessionStorage.setItem("cost_total", record_data.cost_total);
        sessionStorage.setItem("cost_list_count", record_data.cost_list_count);
        sessionStorage.setItem("user_count", record_data.user_count);
        // console.log("cost_total", record_data.cost_total);
        JSON.parse(record_data.cost_list).forEach((cost_item, i)=>{
            $('#cost').val(cost_item.cost)
            $('#item_list').val(cost_item.item_list)
            $('#user_select').val(cost_item.selete_user);
            // console.log(cost_item.share_uesr);
            add_item_function(i, cost_item.share_uesr)
            checkout()

        })
        $('#cost').val('')
        $('#item_list').val('')
        $('#user_select').val('')
        checkout_funciton()
        
    }

}

function copy_by_click(input_element){
    // console.log(input_element);

    var copyText = input_element[0];

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
  
     /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);
  
    /* Alert the copied text */
    // alert("Copied the text: " + copyText.value);

}

function share(){
    set_type()
    var user_data = JSON.stringify({
        user_data: get_user_data(),
        cost_list_count: sessionStorage.getItem('cost_list_count'),
        user_count:  sessionStorage.getItem('user_count'),
        cost_list: sessionStorage.getItem('cost_list'),
        cost_total: sessionStorage.getItem('cost_total'),
        type: sessionStorage.getItem('type')
    })
    // console.log('getincode', user_data);
    var url = window.location.href+`?record_data=${encodeURIComponent(escape(user_data))}`
    var text_normal = $('#pay_someone_block2').text();
    var text_best = $('#best_split_wrapper').text();
    var template = `
        <div class="d-flex justify-content-between mb-4">
            <input class="url_input" value="${url}"></input>
            <button type="button" class="btn btn-info fw-bold copy_btn" id="copy_btn">複製連結</button>
        </div>
        <div class="d-flex justify-content-between mb-4">
            <input class="normal_input input--copy" value="${text_normal}"></input>
            <button type="button" class="btn btn-info fw-bold copy_btn" id="copy_btn_normal">複製<br>一般分帳</button>
        </div>
        <div class="d-flex justify-content-between">
        <input class="best_input input--copy" value="${text_best}"></input>
        <button type="button" class="btn btn-info fw-bold copy_btn" id="copy_btn_best">複製<br>最佳分帳</button>
    </div>`
    // console.log(url);

    call_modal(template, 'share')
    // 註冊一鍵複製事件
    $('#copy_btn').off('click')
    $('#copy_btn').on('click', function(){
        copy_by_click($(this).parent().find('.url_input'))
    })
    $('#copy_btn_normal').on('click', function(){
        copy_by_click($(this).parent().find('.normal_input'))
    })
    $('#copy_btn_best').on('click', function(){
        copy_by_click($(this).parent().find('.best_input'))
    })
}

function set_type(){
    var normal = $('#pay_someone_block2').css("display") != 'none';
    var best = $('#best_split_wrapper').css("display") != 'none';
    if(normal && best){
        // console.log('一般分帳')
        sessionStorage.setItem('type', 'normal')
    } else if(best) {
        // console.log('最佳化');
        sessionStorage.setItem('type', 'best')
    } else {
        // console.log('一般分帳');
        sessionStorage.setItem('type', 'normal')
    }
    // 如果兩個都false 就顯示一般
    // console.log(normal, best);
}

function add_user(){
    var user_count = sessionStorage.getItem("user_count");
    if(ifUserNameEmpty()){
        return
    } else if (verifyIDuplicated()){
        return
    }
    // add_user_data + render 
    update_data(user_count)

    // 刪除
    delete_user(user_count)

    user_count++;
    // console.log(user_count)
    sessionStorage.setItem("user_count", `${user_count}`);
}

function update_data(user_count){

    if(!verifyIDuplicated()){
        add_user_data(user_count)
        render(user_count)  // 渲染畫面
    }
}

function ifUserNameEmpty(){
    if($('#user_name').val().trim() == ''){
        var err_msg='參與分帳人姓名 不能為空'
        call_modal(err_msg)
        return true
    } else {
        return false
    }
}

function verifyIDuplicated(){
    var user_name = $('#user_name').val()
    var user_arr = get_user_data();
    var all_user_name = []
    user_arr.forEach(el => {
        all_user_name.push(el.name)
    });
    if(all_user_name.includes(user_name)){
        var err_msg='分帳人員姓名 已存在 ,請重新輸入'
        call_modal(err_msg)
        return true
    } else {
        return false
    }
}
// 結帳
function checkout(){
    $('#Checkout').click(function(){
        checkout_funciton()
    })
}

function float_to_two(num){
    return parseInt(Math.abs(num)*100)/100
    
}

function checkout_funciton(){
        var user_arr = get_user_data();
        var cost_total =  Number(sessionStorage.getItem("cost_total"));
        var user_count = Number(sessionStorage.getItem("user_count"));
        // console.log('取得資料:' ,get_user_data())
        var user_total = $('#user_total').val()
        var avg_cost = cost_total /user_count ;
        $("#avg_cost").text("").append(`平均每人 : ${float_to_two(avg_cost)} 元`)
        $("#pay_someone_block2").text('').append(`<h3 id='pay_someone_block2_title'>一般分帳</h3>`)
        for(let i= 0 ; i< get_user_data().length ;i++){
            $("#pay_someone_block2").append(`【 ${get_user_data()[i].name} 】 區域 <br>`)
            for(let j = 0 ; j < get_user_data()[i].give_someone.length ;j++){
                if(user_arr[i].id !== get_user_data()[i].give_someone[j].user_id){
                    var tmp = get_user_data()[i].give_someone[j].give_cost - get_user_data()[j].give_someone[i].give_cost;
                    if(tmp > 0){
                        $("#pay_someone_block2").append(`<span class="px-4"> 要給 ${get_user_data()[i].give_someone[j].user_name} --- ${ float_to_two(tmp) } 元 </span><br>`)
                    }else if(tmp == 0){
                        // $("#pay_someone_block2").append(`<span class="px-4"> 跟 ${get_user_data()[i].give_someone[j].user_name} 的 錢 互相抵銷了 </span><br>`)
                    }else if(tmp < 0){
                        $("#pay_someone_block2").append(` <span class="px-4">${get_user_data()[j].give_someone[j].user_name} 要給你  ${float_to_two(tmp)} 元</span><br>`)
                    }
                    // console.log("看看差距",tmp);
                }
            }
            if(i != get_user_data().length-1){
                $("#pay_someone_block2").append(`<hr>`)
            }
        }
        $('#show_checkout_detail').removeClass('hide')
        $('#pay_someone_block2').slideDown(300).addClass('active')
        $('#best_split_wrapper').slideUp(300)
        setTimeout(function(){
            document.querySelector("#pay_someone_block2").scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300)
}

function show_checkout_detail(){
    $('#show_checkout_detail').click(function(){
        var user_arr = get_user_data();
        var cost_total =  Number(sessionStorage.getItem("cost_total"));
        var user_count = Number(sessionStorage.getItem("user_count"));
        $("#detail_block").text('')
        for(let i= 0 ; i< get_user_data().length ;i++){
            $("#detail_block").append(`<span style="font-weight: bold;">${get_user_data()[i].name} 總共代墊 : ${get_user_data()[i].cost} 元</span><br>` )
            for(let j = 0 ; j < get_user_data()[i].give_someone.length ;j++){
                if(user_arr[i].id !== get_user_data()[i].give_someone[j].user_id){
                    $("#detail_block").append(`<span class="px-4">需要給 ${get_user_data()[i].give_someone[j].user_name} - ${float_to_two(get_user_data()[i].give_someone[j].give_cost)} 元</span><br>`)
                }
            }
            if(i != get_user_data().length-1){
                $("#detail_block").append(`<hr>`)
            }
        }
        $('#detail_block').slideToggle(300)
        setTimeout(function(){
            document.querySelector("#show_checkout_detail").scrollIntoView({
                behavior: 'smooth'
            });
        }, 300)
        show_or_hide_text()
    })

}
function show_or_hide_text(){
    $('.text--show').toggle()
    $('.text--hide').toggle()
}

// 新增項目
function add_item(cost_list_count, share_user){
    $('#add_list').click(function(){
        add_item_function(cost_list_count, share_user)
    })
}
function add_item_function(cost_list_count, share_uesr){
    //
    var user_arr = get_user_data()
    var cost = Number( $('#cost').val() )
    var item_list = $('#item_list').val()
    var selete_user = $('#user_select').val()
    var switch_user = $('.attend_user')

    if(!share_uesr) {
        var share_uesr = [];
    }
    for(let i = 0 ; i < switch_user.length ; i++){
        if(switch_user[i].children[0].checked){
            share_uesr.push(switch_user[i])
        }
    }
    var share_str ='';
    for(let i = 0 ; i < share_uesr.length ; i++ ){
        share_str += `[ ${share_uesr[i].innerText?share_uesr[i].innerText:share_uesr[i]} ]`
        if(i!= share_uesr.length-1){
            share_str += ` , `
        }
    }

    if(selete_user == null){
        verify_input(document.querySelector("#user_select"), '請檢查有無選擇代墊付款人')
    } else if(share_uesr.length == 0 && !window.first_render){
        verify_input(document.querySelector("#switch_all_block"), '請檢查 分攤人員 是否 勾選')
    } else if($('#item_list').val().length == 0){
        verify_input(document.querySelector("#item_list"), '請檢查 花費項目 是否 填寫')
    } else if( cost <= 0 || isNaN(cost)){
        verify_input(document.querySelector("#cost"), '請檢查 金額欄位 是否輸入正確資料')
    }else{
        // add_item_function_render()
        var findIndex = user_arr.findIndex(item => item.id == selete_user)
        set_cost_list(user_arr[findIndex].id, item_list, share_uesr, cost, sessionStorage.getItem('cost_list_count'))
        add_item_function_render()

        
        var cost_total =  set_cost_total();
        // 取紀錄
        if(window.first_render){
            cost_total += cost //總金額
            user_arr[findIndex].cost+=cost;//個人帳戶金額
            cost_list_count = Number(sessionStorage.getItem('cost_list_count')) + 1;
            sessionStorage.setItem("cost_list_count", JSON.stringify(cost_list_count));
            sessionStorage.setItem("cost_total", JSON.stringify(cost_total));
        }

        $('#item_list,#cost').val("")
        $("#total_cost").text('').append(`總共花費 : ${cost_total} 元`)

        // set_give_cost(user_arr,selete_user,cost)
        set_give_cost_new(user_arr,selete_user,cost,share_uesr,findIndex)
        store_user_data(user_arr);
        // console.log("我新增一筆",user_arr);

        // 按下結帳後,再新增項目時,先把結帳資訊清空
        $("#pay_someone_block2,#avg_cost").text('')
        // 按下結帳後,再新增項目時,先把把 顯示明細 明細區塊 隱藏
        $('#show_checkout_detail').addClass('hide')
        $("#detail_block,#pay_someone_block2").css('display',"none")
        unlock_checkout()

    }
}

function set_cost_total(){
    var cost_list = JSON.parse(sessionStorage.getItem('cost_list'))
    debugger
    var cost_total = 0
    cost_list.forEach(item=>{
        cost_total += Number(item.item_list)
    })
    return cost_total
}

function add_item_function_render(){
    var cost_list = JSON.parse(sessionStorage.getItem('cost_list'))
    var user_arr = get_user_data()
    var template = ''
    cost_list.forEach((item, i)=>{
        var findIDindex = user_arr.findIndex( el => {
            return el.id == item.selete_user
        })
        template += `<li class="list-group-item d-flex justify-content-between align-items-start" id="${item.list_id}">
            <div class="ms-2 me-auto">
                <div class="fw-bold">代墊人員 : ${user_arr[findIDindex].name} </div>
                購買項目 : ${item.item_list} <br> 
                NT$${item.cost} ===> 分攤人員有 : ${
                    loop_share_user(item.share_uesr)}
            </div>
            <button type="button" class="btn btn-danger align-self-center delete_list">
                <i class="bi bi-trash"></i>
            </button>   
        </li>`
    })
    $('#cost_list').html(template)
    delete_list()
}

function loop_share_user(share_uesr){
    var result = ''
    share_uesr.forEach((user_str, i)=>{
        // console.log(share_uesr.length, i);
        result += i==share_uesr.length-1?`【 ${user_str} 】`:`【 ${user_str} 】 , `
    })
    return result

}

function verify_input(element, msg){
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    setTimeout(function(){
        call_modal(msg)
    }, 300)
}

// 刪除項目
function delete_user(user_count){
    $(`#${user_count}`).click(function(){
        var user_arr = get_user_data()
        var delete_id = $(this).attr('id')
        // console.log('我點到誰',delete_id);
        var return_arr_index = user_arr.findIndex(el=>{
            return el.id == delete_id 
        })
        var err_msg = "" 
        var err_msg_owned = ""
        for(let i = 0 ; i < user_arr.length ; i++){

            // console.log(user_arr[return_arr_index].give_someone[i].give_cost);
        
            if(user_arr[return_arr_index].give_someone[i].give_cost != 0 && user_arr[return_arr_index].id != user_arr[return_arr_index].give_someone[i].user_id){
                err_msg +=`【 ${user_arr[return_arr_index].name} (你) 】 與 【 ${user_arr[return_arr_index].give_someone[i].user_name} 】還有 一些 金錢 曖昧不清楚 ( ${user_arr[return_arr_index].give_someone[i].give_cost} 元 )<br>`  
            }
            if(user_arr[i].give_someone[return_arr_index].give_cost != 0 && user_arr[return_arr_index].id != user_arr[return_arr_index].give_someone[i].user_id){
                err_msg_owned += `【 ${user_arr[i].name} 】 還有 ${user_arr[i].give_someone[return_arr_index].give_cost} 元 沒給  【 ${user_arr[return_arr_index].name} (你)  】<br>`
            }
            
        }
        if ( err_msg != ""){
            call_modal(err_msg+err_msg_owned)
            return
        }

        for(let i= 0 ; i < user_arr.length ;i++ ){
            if(user_arr[i].id == delete_id){
                user_arr.splice(i,1)
            }
        }

        for(let i = 0 ; i <user_arr.length ; i++){
            user_arr[i].give_someone.splice(return_arr_index,1)
        }


        $(this).closest(`#del_${delete_id}`).remove();
        $(`#user_select option[value=${delete_id}]`).remove()
        $(`#Switch_${delete_id}`).remove()
        // console.log("現在剩下",user_arr);
        store_user_data(user_arr);
        })
}

function delete_list(){
    
    $('.delete_list').off('click').click(function(){
        var cost_list = JSON.parse(sessionStorage.getItem('cost_list'))
        var user_arr = JSON.parse(sessionStorage.getItem('user_arr'))
        var delete_list_id = $(this).closest('li').attr('id')
        var cost_total =  Number(sessionStorage.getItem("cost_total"));
        var findIndex = cost_list.findIndex(item=>{
            return item.list_id == delete_list_id
        })

        var index = user_arr.findIndex( item => {
            return item.id == cost_list[findIndex].selete_user
        })
        user_arr[index].cost -= cost_list[findIndex].cost
        sessionStorage.setItem('user_arr',JSON.stringify(user_arr))

        retrun_give_cost(cost_list,delete_list_id,user_arr)

        cost_total-= cost_list[findIndex].cost

        sessionStorage.setItem('cost_list',JSON.stringify(cost_list))
        delete_list_render(cost_total, findIndex, cost_list, $(this))
    })
    
}

function delete_list_render(cost_total, findIndex, cost_list, current_item){
    
    $("#total_cost").text('').append(`總共花費 : ${cost_total}`) 
    sessionStorage.setItem('cost_total',JSON.stringify(cost_total))
    cost_list.splice(findIndex,1)
    sessionStorage.setItem('cost_list_count', JSON.stringify(cost_list.length))
    sessionStorage.setItem('cost_list', JSON.stringify(cost_list))
    // current_item.closest('li').remove()
    $("#avg_cost").text("");
    // $("#pay_someone_block").css('display',"none");
    add_item_function_render()
}

function retrun_give_cost(cost_list,delete_list_id,user_arr){
    // console.log("你有東西嗎 :",cost_list);
    // console.log("阿你哩 ? ",delete_list_id);
    var index = cost_list.findIndex( item => {
        return item.list_id == delete_list_id
    })
    var find_user_arr_index = user_arr[0].give_someone.findIndex( item => {
        return item.user_id == cost_list[index].selete_user
    })

    for( let i = 0 ; i < cost_list[index].share_uesr.length ; i++){
        for( let j = 0 ; j < user_arr.length ;j++ ){
            if(cost_list[index].share_uesr[i] == user_arr[j].name){
                user_arr[j].give_someone[find_user_arr_index].give_cost -= cost_list[index].cost/cost_list[index].share_uesr.length
            }
        }
    }
    sessionStorage.setItem('user_arr',JSON.stringify(user_arr))

}




// 更新使用者資料
function add_user_data(user_count){
    var user_name = $('#user_name').val()
    var user_arr = get_user_data();
    
    user_arr.push({
            id:user_count,
            name:user_name,
            cost:0,
            give_someone :[]
        })
        store_user_data(user_arr);

        for(let i = 0 ; i < user_arr.length ; i++){
            if(i == user_arr.length-1){
                user_arr[i].give_someone = set_give_someone(user_arr.length, user_arr)
            }
            else{
                user_arr[i].give_someone.push({user_id: user_count,user_name:user_name ,give_cost:0})
            }
        }
        store_user_data(user_arr);
        // console.log("我新增囉",user_arr);
}
// 使用他人紀錄渲染畫面
function render_by_record(record_data){
    // console.log(record_data);
    record_data.forEach(user=>{
        $('#user_name').val(user.name)
        render(user.id)
    })
    $('#user_name').val('')
}

// 渲染畫面
function render(user_count){
    var user_name = $('#user_name').val()
    $('#user_block').append(
        `
        <div class="col-12 mt-3 split_member_wrapper" id=del_${user_count}>
            <div class="input-group ">
                <span class="btn btn-danger split_member" id="${user_count}"><i class="bi bi-dash-lg"></i></span>
                <input type="text" class="form-control me-3 split_member_input" value= ${user_name} disabled>
            </div>
        </div>
        `
    )
    // 下拉選單新增選項
    $('#user_select').append(
        `
        <option value="${user_count}">${user_name}</option>
        `
    )
    // 清空輸入框
    $('#user_name').val('')

    // share switch
    $('#pay_share').append(
        `
        <div class="form-check form-switch attend_user mx-3" id=Switch_${user_count}>
                <input class="form-check-input" type="checkbox" role="switch" id="Switch_${user_name}">
                <label class="form-check-label" for="Switch_${user_name}">${user_name}</label>
        </div>            
        `
    )
    // switch_all 
    var  findCheckbox = $('.form-switch');
    if(findCheckbox.length>=2){
        $('#switch_all_block').removeClass('hide')
    }
    
    // switch change
    switch_change()

    set_user_select_by_split_memter()
}

function store_user_data(user_arr){
    var user_arr_str = JSON.stringify(user_arr)
    sessionStorage.setItem("user_arr", user_arr_str);
}

function get_user_data(){
    return JSON.parse(sessionStorage.getItem("user_arr"));
}

function set_give_someone(use_number, user_arr){
        var result=[]            
        for(var i=0;i<use_number;i++){
            result.push({user_id: user_arr[i].id,user_name:user_arr[i].name ,give_cost:0})
        }
        return result
    }

function set_give_cost_new(user_arr,selete_user,cost,share_uesr,findIndex){
    for(let i = 0 ; i < share_uesr.length ; i++){
        for(let j = 0; j < user_arr.length ; j++ ){
            if(share_uesr[i].innerText == user_arr[j].name){
                user_arr[j].give_someone[findIndex].give_cost+= cost/share_uesr.length;
            }
        }
    }
}

function set_user_select_by_split_memter(){
    $('.split_member_wrapper').on('click', function(){
        $('.split_member_input').removeClass('active')
        $('#user_select').val($(this).find('.split_member').attr('id'))
        $(this).find('.split_member_input').addClass('active')
    })
}
function set_user_split_by_memte_select(){
    $('#user_select').on('change', function(){
        $('.split_member_input').removeClass('active')
        var $split_member = $('.split_member_wrapper .split_member')
        for(var i=0; i<$split_member.length;i++){
            if($split_member[i].id == $(this).val()){
                $split_member[i].parentElement.children[1].classList.add('active')
            }
        }
    })
}

function set_cost_list(selete_user,item_list,share_uesr,cost,cost_list_count){
    var cost_list = JSON.parse(sessionStorage.getItem('cost_list'))
    if(!window.first_render){
        cost_list.push({
                selete_user,
                item_list,
                share_uesr: set_share_user(share_uesr),
                cost,
                list_id:`list_${cost_list_count}`
            })
        sessionStorage.setItem('cost_list',JSON.stringify(cost_list))
    }
}

function set_share_user(share_uesr){
    var result=[];
    share_uesr.forEach(item=>{
        result.push(item.innerText)
    })
    return result
}

function switch_all(){
    $('#switch_all').click(function(){
        var status = $('#switch_all').prop('checked');
        // console.log(status);
        var  findCheckbox = $('.form-switch input');
        if(status){
            findCheckbox.prop('checked',true)
        }else{
            findCheckbox.prop('checked',false)
        }
    })
}

function switch_change(){
    $('input[role=switch]').off('click').click(function(){
        var current_switch = $('input[role=switch]');
        var status = [];
        for(let i = 0 ; i < current_switch.length ; i++){
            if(current_switch[i].checked){
            status.push(current_switch[i])
            }
        }
        if(status.length == current_switch.length){
            $('#switch_all').prop('checked',true)
        }
        else{
            $('#switch_all').prop('checked',false);
        }
    })
}

function call_modal(err_msg, type){
    $('.modal-body').text('').append(err_msg)
    if( type == 'share') {
        $('#errorModalLabel').text('分享計算結果')
    }else {
        $('#errorModalLabel').text('輸入錯誤')
    }
    $('#errorModal').modal('show')
}

function unlock_checkout(){
    var list_count = $('#cost_list li')
    if(list_count.length == 1){
        $('#Checkout').removeAttr('disabled')
        $('#best_split').removeAttr('disabled')
        $('#share_btn').removeAttr('disabled')
    }
}

function bambuger_triger(){
    $('.navbar-toggler').on('click', function(){
        $('#navbarColor01').toggle('show')
    })
}

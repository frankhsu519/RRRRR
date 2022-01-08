$(document).ready(function(){
    get_data()
    count_all_user_cost()

})
function get_data(){
    // console.log('新function:', get_user_data());
    var user_data =  get_user_data();
    console.log(user_data);
    // user_data[i].cost  這個是他總共花費的金額

}
function count_all_user_cost(){
    var user_data =  get_user_data();
    var person
    user_data.forEach(user => {
        console.log(user.cost);
    });
}

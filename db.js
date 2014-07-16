//Extend Date object for a unique date ID
Date.prototype.getJulian = function() {
    return Math.floor((this / 86400000) - (this.getTimezoneOffset()/1440) + 2440587.5);
}

//create todays date object
window.today = new Date();

//bind julian to the window to and use it to create new rows every day
window.julian = today.getJulian(); //get Julian counterpart 

//create db object
window.db = {
    // change DB-NAME to your desired db name
    db: openDatabase('mydb', '1.0', 'DB-NAME', 2 * 1024 * 1024),
    init: function(){
        this.db.transaction(function (tx) {
            //create table called day
            tx.executeSql('CREATE TABLE IF NOT EXISTS day (date unique, COLUMN1, COLUMN2, COLUMN3)');
            //create table named avg
            tx.executeSql('CREATE TABLE IF NOT EXISTS avg (date unique, COLUMN1, COLUMN2, COLUMN3)');
        });
    },
    insert: function(keys, values, tableName){
        // keys and values must be in () ex: insert('(date)', '(julian-1)')
        // table name default to day table but you can add another table name ex: month 
        var tableName = (tableName) ? tableName : "day"; 
        this.db.transaction(function (tx) {
            tx.executeSql('INSERT INTO '+tableName+' '+keys+' VALUES '+values);
        });
    },
    update: function(where, keys, values, tableName){
        // table name ex: day
        // keys must end with a =? ex: date=?, diet=?
        // where sql condition ex: date = 22222222
        // values must be in an array ['May 10', 5]
        var tableName = (tableName) ? tableName : "day"; 
        this.db.transaction(function (tx) {
           tx.executeSql('UPDATE '+tableName+' SET '+keys+' WHERE '+where, values);
        });
    },
    selectBetween: function(start,end,callBack){
        this.db.transaction(function (tx) {
            var query = 'SELECT date, stress, seizure, sleep, exercise, diet, startTime, endTime FROM day WHERE date BETWEEN ' + start +' AND ' + end;
            tx.executeSql(query, [], function (tx, results) {
                var len = results.rows.length, i;
                var data = [];
                for (i = 0; i < len; i++){
                   data.push(results.rows.item(i));
                }
                callBack(data);
            }, this.onError);
        });
    },
    select: function(count, callBack, tableName){ // <-- extra param
        //count is the number of rows you want starting from todays julian date. 
        //If today was "2456808" then select(2) would return today, yesterday, and the day before
        //iterating over (2456808 - 2) would return 2456808, 2456807, 2456806
        //callBack is how you can retrieve data. db.get(2,function(data){console.log('data')})
        // the above function will log the results for the past three days
        var tableName = (tableName) ? tableName : "day"; 
        this.db.transaction(function (tx) {
            var query;
            if(count !== ''){
                query = 'SELECT * FROM day WHERE date '+db.dateRange(count);
            }else{
                query = 'SELECT * FROM avg';
            }
            tx.executeSql(query, [], function (tx, results) {
                var len = results.rows.length, i;
                var data = {};
                for (i = 0; i < len; i++){
                   data[i] = results.rows.item(i);
                }
                callBack(data);
            }, this.onError);
        });
    },
    //select a specific row based on the julian value
    selectKey: function(key, callBack){ // <-- extra param
        this.db.transaction(function (tx) {
            var query = 'SELECT * FROM day WHERE date='+key;
            tx.executeSql(query, [], function (tx, results) {
                var len = results.rows.length, i;
                var data = {};
                for (i = 0; i < len; i++){
                   data[i] = results.rows.item(i);
                }
                callBack(data);
            }, this.onError);
        });
    },
    onError: function( err ){
        console.log(err);
    }
}
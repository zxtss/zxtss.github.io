var dataList = [];
var total=0;
(function () {
    var dbObject = {};
    dbObject.init = function (params) {
        this.db_name = params.db_name;
        this.db_version = params.db_version;
        this.db_store_name = params.db_store_name;
        if (!window.indexedDB) {
            window.alert("你的浏览器不支持IndexDB,请更换浏览器");
        }

        var request = indexedDB.open(this.db_name, this.db_version);
        //打开数据失败
        request.onerror = function (event) {
            alert("不能打开数据库,错误代码: " + event.target.errorCode);
        };
        request.onupgradeneeded = function (event) {
            this.db = event.target.result;
            this.db.createObjectStore(dbObject.db_store_name);
        };
        //打开数据库
        request.onsuccess = function (event) {
            //此处采用异步通知. 在使用curd的时候请通过事件触发
            dbObject.db = event.target.result;
        };
    };
    /**
     * 增加和编辑操作 
     */
    dbObject.put = function (params, key) {
        //此处须显式声明事物
        var transaction = dbObject.db.transaction(dbObject.db_store_name, "readwrite");
        var store = transaction.objectStore(dbObject.db_store_name);
        var request = store.put(params, key);
        request.onsuccess = function () {
            // alert('添加成功');
        };
        request.onerror = function (event) {
            console.log(event);
        }
    };
    /**
     * 删除数据 
     */
    dbObject.delete = function (id) {
        // dbObject.db.transaction.objectStore is not a function
        request = dbObject.db.transaction(dbObject.db_store_name, "readwrite").objectStore(dbObject.db_store_name).delete(id);
        request.onsuccess = function () {
            // alert('删除成功');
        }
    };

    /**
     * 查询操作 
     */
    dbObject.select = function (key) {
        //第二个参数可以省略
        var transaction = dbObject.db.transaction(dbObject.db_store_name, "readwrite");
        var store = transaction.objectStore(dbObject.db_store_name);
        if (key)
            var request = store.get(key);
        else
            var request = store.getAll();

        request.onsuccess = function () {
            console.log(request.result);
        }
    };
    /**
 * 分页查询操作 
 */
    dbObject.selectPage = function (pageIndex, size) {
        let page = pageIndex || 1, pageSize = size || 50, data = []
        let store = dbObject.db.transaction(dbObject.db_store_name, 'readonly').objectStore(dbObject.db_store_name,)
        let requeset = store.openCursor()
        let count = store.count()
        let index = null
        requeset.onsuccess = function (event) {
            let res = event.target.result;
            if (res) {
                if (index === pageSize - 1) {
                    data.push(res.value);
                    console.log('读取数据成功：', data);
                    console.log('总条目', count.result);
                    dataList = data;
                    total=count.result;
                    return
                }
                if (index === null && page !== 1) {
                    console.log('读取跳过：', (page - 1) * pageSize);
                    index = 0
                    res.advance((page - 1) * pageSize)
                } else {
                    index++
                    data.push(res.value);
                    res.continue();
                }
            } else {
                console.log('读取数据成功：', data);
                console.log('总条目', count.result);
                dataList = data;
                total=count.result;
            }
        }
        requeset.onerror = function () {
            console.log('读取数据失败')
        }
    };
    /**
     * 清除整个对象存储(表)
     */
    dbObject.clear = function () {
        var request = dbObject.db.transaction(dbObject.db_store_name, "readwrite").objectStore(dbObject.db_store_name).clear();
        request.onsuccess = function () {
            // alert('清除成功');
        }
    };
    window.dbObject = dbObject;
})();
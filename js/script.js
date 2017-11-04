/**
 * Created by billyzou on 2017/11/4.
 */
var jsonPack;

function login() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('wait').style.display = 'block';
    $.get("http://oldcar-ssl.smartgslb.com/getUserInfo/?id=1026", function(data, status) {
        document.getElementById('wait').style.display = 'none';
        document.getElementById('main').style.display = 'block';
        document.body.style.backgroundColor = '#8A949B';
        jsonPack = data.data;
        console.log(jsonPack);
        addElements(jsonPack);
    });
}

function mainInterface() {
    document.getElementById('wait').style.display = 'none';
}

function addElements(data) {
/* 绘制雷达图 */
    var mData = [];
    for (var key in data.radar) {
        var temp_list = [];
        temp_list.push(key);
        temp_list.push(parseFloat(data.radar[key]) > 1.2 ? 1.2 : parseFloat(data.radar[key]));
        mData.push(temp_list);
    }
    var mW = 300;
    var mH = 300;
    var mCount = mData.length; //边数
    var mCenter = mW /2; //中心点
    var mRadius = mCenter - 50; //半径(减去的值用于给绘制的文本留空间)
    var mAngle = Math.PI * 2 / mCount; //角度
    var mCtx = null;
    var mColorPolygon = '#B8B8B8'; //多边形颜色
    var mColorLines = '#B8B8B8'; //顶点连线颜色
    var mColorText = '#000000';

//初始化
    (function(){
        var canvas = document.createElement('canvas');
        canvas.id = 'radar';
        document.getElementById('characteristic').appendChild(canvas);
        canvas.height = mH;
        canvas.width = mW;
        mCtx = canvas.getContext('2d');

        drawPolygon(mCtx);
        drawLines(mCtx);
        drawText(mCtx);
        drawRegion(mCtx);
        drawCircle(mCtx);
    })();

// 绘制多边形边
    function drawPolygon(ctx){
        ctx.save();

        ctx.strokeStyle = mColorPolygon;
        var r = mRadius/ mCount; //单位半径
        //画6个圈
        for(var i = 0; i < mCount; i ++){
            ctx.beginPath();
            var currR = r * ( i + 1); //当前半径
            //画6条边
            for(var j = 0; j < mCount; j ++){
                var x = mCenter + currR * Math.cos(mAngle * j);
                var y = mCenter + currR * Math.sin(mAngle * j);

                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    }

//顶点连线
    function drawLines(ctx){
        ctx.save();

        ctx.beginPath();
        ctx.strokeStyle = mColorLines;

        for(var i = 0; i < mCount; i ++){
            var x = mCenter + mRadius * Math.cos(mAngle * i);
            var y = mCenter + mRadius * Math.sin(mAngle * i);

            ctx.moveTo(mCenter, mCenter);
            ctx.lineTo(x, y);
        }

        ctx.stroke();

        ctx.restore();
    }

//绘制文本
    function drawText(ctx){
        ctx.save();

        var fontSize = mCenter / 12;
        ctx.font = fontSize + 'px Microsoft Yahei';
        ctx.fillStyle = mColorText;

        for(var i = 0; i < mCount; i ++){
            var x = mCenter + mRadius * Math.cos(mAngle * i);
            var y = mCenter + mRadius * Math.sin(mAngle * i);

            if( mAngle * i >= 0 && mAngle * i <= Math.PI / 2 ){
                ctx.fillText(mData[i][0], x, y + fontSize);
            }else if(mAngle * i > Math.PI / 2 && mAngle * i <= Math.PI){
                ctx.fillText(mData[i][0], x - ctx.measureText(mData[i][0]).width, y + fontSize);
            }else if(mAngle * i > Math.PI && mAngle * i <= Math.PI * 3 / 2){
                ctx.fillText(mData[i][0], x - ctx.measureText(mData[i][0]).width, y);
            }else{
                ctx.fillText(mData[i][0], x, y);
            }

        }

        ctx.restore();
    }

//绘制数据区域
    function drawRegion(ctx){
        ctx.save();

        ctx.beginPath();
        for(var i = 0; i < mCount; i ++){
            var x = mCenter + mRadius * Math.cos(mAngle * i) * mData[i][1];
            var y = mCenter + mRadius * Math.sin(mAngle * i) * mData[i][1];

            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(40, 183, 141, 0.5)';
        ctx.fill();

        ctx.restore();
    }

//画点
    function drawCircle(ctx){
        ctx.save();

        var r = mCenter / 36;
        for(var i = 0; i < mCount; i ++){
            var x = mCenter + mRadius * Math.cos(mAngle * i) * mData[i][1];
            var y = mCenter + mRadius * Math.sin(mAngle * i) * mData[i][1];

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(40, 183, 141, 0.8)';
            ctx.fill();
        }

        ctx.restore();
    }

/* 读取个人信息 */
    document.getElementById('fullname').innerText = jsonPack.user.name;
    document.getElementById('licenseinfo').innerText = jsonPack.user.licenseinfo;
    document.getElementById('carinfo').innerText = jsonPack.user.carinfo;

/* 绘制违章记录 */
    var i = 0;
    var maxTag = 0;

    for (var key in jsonPack.tags) {
        if (jsonPack.tags[key] > maxTag) {
            maxTag = jsonPack.tags[key];
        }
    }

    for (var key in jsonPack.tags) {
        var newDiv = document.createElement('div');
        newDiv.className = 'mdui-chip';
        var newSpan = document.createElement('span');
        newSpan.className = 'mdui-chip-title';
        newSpan.innerText = key;
        newDiv.appendChild(newSpan);
        var opacity = jsonPack.tags[key] / maxTag;
        newDiv.style.backgroundColor = 'rgba(40, 183, 141, ' + opacity + ')';
        document.getElementById('cloud').appendChild(newDiv);
    }

    for (var key in jsonPack.events){
        if (i === 0) {
            var newLi = document.createElement('li');
            newLi.className = 'mdui-list-item';
            var newIcon = document.createElement('i');
            newIcon.className = 'mdui-list-item-icon mdui-icon material-icons';
            newIcon.innerHTML = 'looks_one';
            newLi.appendChild(newIcon);
            var newDiv = document.createElement('div');
            newDiv.className = 'mdui-list-item-content';
            newDiv.innerHTML = jsonPack.events[key].describe + '(' + jsonPack.events[key].times + '次)';
            newLi.appendChild(newDiv);
            document.getElementById('violationList').appendChild(newLi);
            i++;
        }
        else if (i === 1) {
            var newLi = document.createElement('li');
            newLi.className = 'mdui-list-item';
            var newIcon = document.createElement('i');
            newIcon.className = 'mdui-list-item-icon mdui-icon material-icons';
            newIcon.innerHTML = 'looks_two';
            newLi.appendChild(newIcon);
            var newDiv = document.createElement('div');
            newDiv.className = 'mdui-list-item-content';
            newDiv.innerHTML = jsonPack.events[key].describe + '(' + jsonPack.events[key].times + '次)';
            newLi.appendChild(newDiv);
            document.getElementById('violationList').appendChild(newLi);
            i++;
        }
        else if (i === 2) {
            var newLi = document.createElement('li');
            newLi.className = 'mdui-list-item';
            var newIcon = document.createElement('i');
            newIcon.className = 'mdui-list-item-icon mdui-icon material-icons';
            newIcon.innerHTML = 'looks_3';
            newLi.appendChild(newIcon);
            var newDiv = document.createElement('div');
            newDiv.className = 'mdui-list-item-content';
            newDiv.innerHTML = jsonPack.events[key].describe + '(' + jsonPack.events[key].times + '次)';
            newLi.appendChild(newDiv);
            document.getElementById('violationList').appendChild(newLi);
            i++;
        } else {
            break;
        }
    }

/* 已绑定车辆 */
    for (var car in jsonPack.devices) {
        var newLi = document.createElement('li');
        newLi.className = 'mdui-list-item';
        var newDiv = document.createElement('div');
        newDiv.className = "mdui-list-item-content";
        newDiv.innerText = jsonPack.devices[car];
        newLi.appendChild(newDiv);
        var newIcon = document.createElement('i');
        newIcon.className = 'mdui-list-item-icon mdui-icon material-icons';
        newIcon.innerText = 'delete';
        newLi.appendChild(newIcon);
        document.getElementById('deviceList').appendChild(newLi);
    }
}

function displayRadar() {
    if (document.getElementById('radar').style.animation === '') {
        document.getElementById('radar').style.animation = 'zoomIn 1s';
    } else {
        document.getElementById('radar').style.animation = '';
    }
}


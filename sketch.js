/**
 * Created by Shucheng on 12/8/2016.
 */
var canvas;
var balls = [];
var balls2 = [];
var points = [];
var points2 = [];
var lines = [];
var lines2 = [];
var cor_balls = [];
var cor_balls2 = [];
var cor_lines = [];
var cor_lines2 = [];
var elems = [balls, balls2, points, points2, lines, lines2,
            cor_balls, cor_balls2, cor_lines, cor_lines2];
var mode = 0;
var line_clicks = [[],[]];
var line_clicks2 = [[],[]];
var clicked = false;
var A = numeric.rep([8,9],0);
var H = numeric.rep([3,3],1);
var invH = numeric.rep([3,3],1);

function setup() {
    // setup code
    canvas = createCanvas(840,320);
    background('rgba(200,200,200,0.2)');
    //background(poolTable, 100);
    var pos = $("#existing-iframe-example").offset();
    console.log(pos);
    canvas.position(pos["left"]+4,pos["top"]+4);
    // canvas.style('z-index', '-1');
    loadImage("images/PoolTableReferenceTop.jpg", function(img) {
        console.log('aaa')
        image(img, 660, 0);
    });
}

function mousePressed() {
    var oX = mouseX;
    var oY = mouseY;
    console.log(mode);
    if (mode == 0) {
        if (oX >= 0 && oX <= 840 &&
            oY >= 0 && oY <= 320) {
            var b = new Ball(oX, oY, 3, color(255));
            balls.push(b);
            console.log(balls);
        }
    } else if (mode == 1) {
        if (oX >= 0 && oX <= 640 &&
            oY >= 0 && oY <= 320) {
            var p1 = new Ball(oX, oY, 3, color(points.length*60));
            points.push(p1);
            console.log(points, lines);
            if (points.length == 2) {
                var line11  = new Line(points[0].x, points[0].y,
                points[1].x, points[1].y, color(100,0,0));
                lines.push(line11);
            } else if (points.length == 4) {
                var line12  = new Line(points[2].x, points[2].y,
                points[3].x, points[3].y, color(0,100,0));
                lines.push(line12);
            }
        } else if (oX >= 660 && oX <= 840 &&
                    oY >= 0 && oY <= 320) {
            var p2 = new Ball(oX, oY, 1, color(points2.length*60));
            points2.push(p2);
            console.log(points2);
            if (points2.length == 2) {
                var line21  = new Line(points2[0].x, points2[0].y,
                points2[1].x, points2[1].y, color(100,0,0));
                lines2.push(line21);
            } else if (points2.length == 4) {
                var line22  = new Line(points2[2].x, points2[2].y,
                points2[3].x, points2[3].y, color(0,100,0));
                lines2.push(line22);
            }
        }
    } else if (mode == 2) {
        var ball_color;
        if (oX >= 0 && oX <= 640 &&
            oY >= 0 && oY <= 320) {
            ball_color = color(random(0,255),random(0,255),random(0,255),25);
            var cb1 = new Ball(oX, oY, 3, ball_color);
            var coords1 = numeric.transpose([[oX,oY,1]]);
            var coords2 = numeric.dotMMsmall(H, coords1);
            console.log(oX, oY, coords1, coords2);
            console.log(coords2[0][0]/coords2[2][0], coords2[1][0]/coords2[2][0]);
            var cb2 = new Ball((coords2[0][0]/coords2[2][0]), (coords2[1][0]/coords2[2][0]), 4, ball_color);
            cor_balls.push(cb1);
            cor_balls2.push(cb2);
        } else if (oX >= 660 && oX <= 840 &&
                    oY >= 0 && oY <= 320) {
            ball_color = color(random(0,255),random(0,255),random(0,255),75);
            cb2 = new Ball(oX, oY, 4, ball_color);
            coords2 = numeric.transpose([[oX,oY,1]]);
            coords1 = numeric.dotMMsmall(invH, coords2);
            cb1 = new Ball(coords1[0][0]/coords1[2][0], coords1[1][0]/coords1[2][0], 3, ball_color);
            console.log(coords2, coords1);
            cor_balls.push(cb1);
            cor_balls2.push(cb2);
        }
    } else if (mode == 3) {
        var cor_l1;
        var cor_l2;
        if (oX >= 0 && oX <= 640 &&
            oY >= 0 && oY <= 320) {
            if (!clicked) {
                line_clicks[0] = [oX,oY];
                coords1 = numeric.transpose([[oX,oY,1]]);
                coords2 = numeric.dotMMsmall(H, coords1);
                line_clicks2[0] = [coords2[0][0]/coords2[2][0], coords2[1][0]/coords2[2][0]];
                clicked = true;
            } else {
                line_clicks[1] = [oX,oY];
                coords1 = numeric.transpose([[oX,oY,1]]);
                coords2 = numeric.dotMMsmall(H, coords1);
                line_clicks2[1] = [coords2[0][0]/coords2[2][0], coords2[1][0]/coords2[2][0]];
                clicked = false;
                cor_l1 = new Line(line_clicks[0][0], line_clicks[0][1], line_clicks[1][0], line_clicks[1][1], color(0,200,0));
                cor_l2 = new Line(line_clicks2[0][0], line_clicks2[0][1], line_clicks2[1][0], line_clicks2[1][1], color(0,0,200));
                cor_lines.push(cor_l1);
                cor_lines2.push(cor_l2);
            }
        } else if (oX >= 660 && oX <= 840 &&
                    oY >= 0 && oY <= 320) {
            if (!clicked) {
                line_clicks2[0] = [oX,oY];
                coords2 = numeric.transpose([[oX,oY,1]]);
                coords1 = numeric.dotMMsmall(invH, coords2);
                line_clicks[0] = [coords1[0][0]/coords1[2][0], coords1[1][0]/coords1[2][0]];
                clicked = true;
            } else {
                line_clicks2[1] = [oX,oY];
                coords2 = numeric.transpose([[oX,oY,1]]);
                coords1 = numeric.dotMMsmall(invH, coords2);
                line_clicks[1] = [coords1[0][0]/coords1[2][0], coords1[1][0]/coords1[2][0]];
                clicked = false;
                cor_l1 = new Line(line_clicks[0][0], line_clicks[0][1], line_clicks[1][0], line_clicks[1][1], color(0,200,0));
                cor_l2 = new Line(line_clicks2[0][0], line_clicks2[0][1], line_clicks2[1][0], line_clicks2[1][1], color(0,0,200));
                cor_lines.push(cor_l1);
                cor_lines2.push(cor_l2);
            }
        }
    }
}

function chooseAnchor() {
    points = [];
    points2 = [];
    mode = 1;
}

function corres_points() {
    mode = 2;
}

function corres_lines() {
    mode = 3;
}

function getH() {
    console.log(A,H,invH);
    if (points.length < 4 || points2.length < 4) {
        alert("Not enough points selected!");
        return;
    }
    for (var r=0; r<4; r++) {
        A[2*r][0] = -points[r].x; //-x
        A[2*r][1] = -points[r].y; //-y
        A[2*r][2] = -1;
        A[2*r][6] = points[r].x * (points2[r].x); //xx'
        A[2*r][7] = points[r].y * (points2[r].x); //yx'
        A[2*r][8] = (points2[r].x); //x'

        A[2*r+1][3] = -points[r].x; //-x
        A[2*r+1][4] = -points[r].y; //-y
        A[2*r+1][5] = -1;
        A[2*r+1][6] = points[r].x * points2[r].y; //xy'
        A[2*r+1][7] = points[r].y * points2[r].y; //yy'
        A[2*r+1][8] = points2[r].y; //y'
    }
    print(A);
    var A_trans = numeric.transpose(A); //numeric.js requires m>n
    var result = numeric.svd(A_trans);
    var hs = result["U"]; //U for A_trans = V_trans for A
    H[0][0] = hs[0][7];
    H[0][1] = hs[1][7];
    H[0][2] = hs[2][7];
    H[1][0] = hs[3][7];
    H[1][1] = hs[4][7];
    H[1][2] = hs[5][7];
    H[2][0] = hs[6][7];
    H[2][1] = hs[7][7];
    H[2][2] = hs[8][7];

    console.log(result, hs ,H);

    invH = numeric.inv(H);
    alert("Transformation matrix calculated!");
}

function clearALL() {
    clear();
    background('rgba(200,200,200,0.2)');
    loadImage("images/PoolTableReferenceTop.jpg", function(img) {
        image(img, 660, 0);
    });
    for (var i=0; i<elems.length; i++) {
        elems[i].splice(0,elems[i].length);
    }
    mode = 0;
}

function draw() {
    //draw code
    for (var i=0; i<elems.length; i++) {
        var e = elems[i];
        for (var j=0; j<e.length; j++) {
            e[j].display();
        }
    }
}

function go_get() {
    var base_url = 'http://www.youtube.com/embed?listType=search&list=';
    var search_field = document.getElementById('yourtextfield').value;
    var target_url = base_url + search_field;
    var ifr = document.getElementById('existing-iframe-example');
    ifr.src = target_url;
    return false;
}

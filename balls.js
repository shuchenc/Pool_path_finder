/**
 * Created by Shucheng on 12/8/2016.
 */
function Ball(x,y,r,c) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.col = c;
    this.display = function() {
        stroke(this.col);
        fill(this.col, 50);
        ellipse(this.x, this.y, this.r*2, this.r*2);
    }
}


function Line(x1,y1,x2,y2,c) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.col = c;
    this.display = function() {
        stroke(this.col);
        line(this.x1, this.y1, this.x2, this.y2);
    }
}
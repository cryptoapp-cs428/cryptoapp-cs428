  function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function getNumberSize(valueHex){
    var value = valueHex.substring(0,1);
    var lines =  Math.floor(parseInt(value, 16) / 4);
    console.log(lines);

    return lines;
  }

  function createShape(){
    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.createShape();
  }

  function addItem(ctx){
       var canv = document.createElement("canvas");
       // <canvas id="canvas1" width="100" height="100" style="border:solid 1px;"></canvas>

       canv.width = 200;
       canv.height = 200;
       var ctx = canv.getContext("2d");

       //canv.getContext("2d").fillArea(3, 3, '#FF0000');
       ctx.triangle(80,50,80, 80, '#ff00ff');
       ctx.fill();
       ctx.stroke();
       document.getElementById("container").appendChild(canv);
   }

const utility = {
    triangle: function(ctx, x, y, width, height, color) {
      // if values are not set just exit
      if(!x || !y || !width || !height) { return true; }

      console.log("we are about to draw a triangle");
      ctx.fillStyle = color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + width/2, y);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width/2, y);
      ctx.closePath();
    },

    pentagon: function(ctx, x, y, width, height, color) {
      // if values are not set just exit
      if(!x || !y || !width || !height) { return true; }

      ctx.fillStyle = color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(x + width/2, y);
      ctx.lineTo(x, y + height*0.4);
      ctx.lineTo(x + width*0.2, y + height);
      ctx.lineTo(x + width*0.8, y + height);
      ctx.lineTo(x + width, y + height*0.4);
      ctx.lineTo(x + width/2, y);
      ctx.closePath();
    },

    fillArea: function(ctx, width, height, color) {

      // if values are not set just exit
      var x = 3;
      var y = 3;
      if(!width || !height || !color) { return true; }

      var image = ctx.getImageData(0, 0, width, height);
          var imageData = image.data;
          var pixelStack = [[x, y]];
          var px1, newPos, pixelPos, reachLeft, reachRight, colorTemp;

      function _getPixel(pixelPos) {
        return {r:imageData[pixelPos], g:imageData[pixelPos+1], b:imageData[pixelPos+2], a:imageData[pixelPos+3]};
      }

      function _setPixel(pixelPos) {
        imageData[pixelPos] = color.r;
        imageData[pixelPos+1] = color.g;
        imageData[pixelPos+2] = color.b;
        imageData[pixelPos+3] = color.a;
      }

      function _comparePixel(px2) {
        return (px1.r === px2.r && px1.g === px2.g && px1.b === px2.b && px1.a === px2.a);
      }

      // get pixel at x/y position
      var px1 = _getPixel(((y * width) + x) * 4);

      // quick way to get formatted rgba color
      colorTemp =ctx.canvas.style.color;
      ctx.canvas.style.color = color;
      console.log(ctx.canvas);
      color = ctx.canvas.style.color.match(/^rgba?\((.*)\);?$/)[1].split(',');
      ctx.canvas.style.color = colorTemp;

      color = {
        r: parseInt(color[0], 10),
        g: parseInt(color[1], 10),
        b: parseInt(color[2], 10),
        a: parseInt(color[3] || 255, 10)
      };

      // if pixel and color the same do nothing
      if (_comparePixel(color)) { return true; }

      while (pixelStack.length) {
        newPos = pixelStack.pop();

        pixelPos = (newPos[1]*width + newPos[0]) * 4;
        while(newPos[1]-- >= 0 && _comparePixel(_getPixel(pixelPos))) {
          pixelPos -= width * 4;
        }

        pixelPos += width * 4;
        ++newPos[1];
        reachLeft = false;
        reachRight = false;

        while (newPos[1]++ < height-1 && _comparePixel(_getPixel(pixelPos))) {
          _setPixel(pixelPos);

          if (newPos[0] > 0) {
            if (_comparePixel(_getPixel(pixelPos - 4))) {
              if (!reachLeft) {
                pixelStack.push([newPos[0] - 1, newPos[1]]);
                reachLeft = true;
              }
            }
            else if(reachLeft) {
              reachLeft = false;
            }
          }

          if (newPos[0] < width-1) {
            if (_comparePixel(_getPixel(pixelPos + 4))) {
              if (!reachRight) {
                pixelStack.push([newPos[0] + 1, newPos[1]]);
                reachRight = true;
              }
            }
            else if(reachRight) {
              reachRight = false;
            }
          }

          pixelPos += width * 4;
        }
      }

      ctx.putImageData(image, 0, 0);
    },

    createShape: function(ctx, value) {
      if (!value){
        //value = '99ad7768f2aa9a1964d6812ke55m1gkr2d7o6719d96ne2gg';
        value = (Math.floor(Math.random() * 16)).toString(16).toUpperCase() + getRandomColor() + 'aaa';
        console.log(value);
      }
      var color = '#' + value.substring(1, 7);

      console.log(color);
      var lines = getNumberSize(value);

      ctx.fillStyle = color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;

      var canv = document.createElement("canvas");
      canv.width = 200;
      canv.height = 200;
      var ctx = canv.getContext("2d");

      //document.getElementById("container").appendChild(canv);

      switch (lines) {
        case 0:
        this.fillArea(ctx, 75, 15, color);
          break;
        case 1:
        ctx.triangle(ctx, 80, 50, 75, 75, color);
        ctx.fill();
        ctx.stroke();
          break;
        case 2:
        ctx.fillArea(ctx, 75, 75, color);
          break;
        case 3:
        console.log("PENTAGON");
        ctx.pentagon(ctx, 80, 50, 75, 75, color);
        ctx.fill();
        ctx.stroke();
          break;
        default:

      }
    }

};

export default utility;

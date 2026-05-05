
var canvasstate = 1;
var uploadedImage;

$(document).ready(function(){
    $.ajaxSetup({ cache: false }); // or iPhones don't get fresh data
});

window.onload = function () {
    var canvas = document.getElementById('camerafilter');
    canvas.width = 500;
    canvas.height = 500;
    var context = canvas.getContext('2d');
    var img = document.getElementById('cameraframe');
    var video = document.getElementById('video');
    var FR = 60;
    var stream = null;
    var frontFacing = true;
    draw(video, canvas, context, FR, img);


    // Event addEventListener
    var btnSnapshot = document.getElementById('btnSnapshot');
    var btnSave = document.getElementById('btnSave');
    var btnRefresh = document.getElementById('btnRefresh');
    var sccsMsg = document.getElementById('success-msg');
    var btnUpload = document.getElementById('btnUpload');
    var btnFlip = document.getElementById('btnFlip');
    var uploadImage = document.getElementById('upload-image');

    btnSnapshot.addEventListener('click', function () {
        // Guardar imagen
        var stillimage = document.getElementById('stillimage');
        var data = canvas.toDataURL('image/png');
        colocarTexto();
        canvasstate = 2;
        btnUpload.style.display = "none";
        btnSnapshot.style.display = "none";
        btnFlip.style.display = "none";
        btnSave.style.display = "inline-block";
        $("#success-msg").fadeIn();
    });

    btnSave.addEventListener('click', function () {
        guardarFoto();
    });

    btnSave.addEventListener('tap', function () {
        if (_isMobile()) {
            guardarFoto();
        }
    });

    btnRefresh.addEventListener('click', function() {
        window.location.reload();
    });

    function guardarFoto() {

        $("#success-msg").html('Thank you for sending your picture!');
        $(".camera-actions").css('display','none');

        var dataURL = canvas.toDataURL();
        $.ajax({
        type: "POST",
        url: "guardarfoto.php",
        data: { 
            imgBase64: dataURL
        },
        cache: false,
        async: false,
        headers: { "cache-control": "no-cache" },
        }).done(function(response) {
            console.log('saved: ' + response); 
        }).fail(function(xhr, ajaxOptions, thrownError) {
            console.log( "11 3error" );
            console.log( xhr.responseText );
            console.log( thrownError );
        });

        var canvasblob = canvas.toBlob(function (res) {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(res);
            a.download = 'hipertension.png';
            document.body.appendChild(a);
            a.click();

        });
    }

    function draw(video, canvas, context, frameRate, img) {
        if (canvasstate === 1) {
            context.save();
            context.scale(-1, 1);
            context.drawImage(video, getWidthScaled(canvas.height) * -1, 0, getWidthScaled(canvas.height), canvas.height);
            context.restore();
            context.drawImage(img, 0, 0, canvas.height, canvas.width);
            setTimeout(draw, 1 / frameRate, video, canvas, context, frameRate, img);
        } else if(canvasstate === 3) {
            var scaledToRatio = getWidthScaledUploaded(uploadedImage, canvas.width);
            context.fillStyle = 'White';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(uploadedImage,  (canvas.width / 2) - (scaledToRatio.width / 2), (canvas.height / 2) - (scaledToRatio.height / 2), scaledToRatio.width, scaledToRatio.height);
            context.drawImage(img, 0, 0, canvas.height, canvas.width);
            colocarTexto();
            setTimeout(draw, 1 / frameRate, uploadedImage, canvas, context, frameRate, img);
        }
    }
    
    btnUpload.addEventListener('click', function() {
        uploadImage.click();
    });
    
    btnFlip.addEventListener('click', function() {
        frontFacing = !frontFacing;
        reStream(frontFacing);
    });
    
    
    var tmpImg = new Image();
    uploadImage.onchange = function(evt) {
        var files = evt.target.files; // FileList object
        var file = files[0];
        if(file.type.match('image.*')) {
            var reader = new FileReader();
            // Read in the image file as a data URL.
            reader.readAsDataURL(file);
            reader.onload = function(evt){
                if( evt.target.readyState == FileReader.DONE) {
                    tmpImg.src = evt.target.result;
                uploadedImage = tmpImg;
                canvasstate = 3;
                btnUpload.style.display = "none";
                btnSnapshot.style.display = "none";
                btnSave.style.display = "inline-block";
                
                setTimeout(function(){ colocarTexto(); }, 2000);
                $("#success-msg").fadeIn();
            }
            }    

        } else {
            alert("You must select an image");
        }
    };
    
    reStream(frontFacing);
    function reStream(frontfacing) {
        
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width: 720,
                height: 720,
                facingMode: frontfacing ? 'user' : 'environment'
            }
        }).then(function (_stream) {
            stream = _stream;
            let video = document.getElementById('video');
            video.srcObject = _stream;
            video.onloadedmetadata = function (e) {
                video.muted = true;
                video.play();
            };
        }).catch(function (err) {
            console.log(err)
        });
        
    }

    function colocarTexto() {
        $('#camera-actions2').css('display','none');
        var texto = $('#textoimg').val();
        if (texto.length > 0) {
            context.font = "40px Roboto Condensed";
            context.fillStyle = "white";
            context.textAlign = "center";
            context.fillText(texto, canvas.width/2, (canvas.height*0.75));
        }
    }
    

    

    forceResponsive();

}

if (window.location.protocol !== 'https:') {
    window.location = 'https://' + window.location.hostname + window.location.pathname + window.location.hash;
}

window.onresize = forceResponsive;

function forceResponsive() {
    // Calculate resizing 
    if(window.innerWidth >= window.innerHeight) { // Landscape
        $("canvas").css("width", "400px");
        $("canvas").css("height", "400px");
    } else { // Portrait
        $("canvas").css("width", "90vw");
        $("canvas").css("height", "90vw");
    }
}

function getWidthScaled(canvasHeight) {
    //
    //   1920         x
    //   ---- = ---------------
    //   1080    windowHeight
    //
    var regularRatio = 0;
    if(_isMobile()) {
        regularRatio = 720/720;
    } else {
        regularRatio = 720/720;
    }
    return canvasHeight * regularRatio;
}

function getWidthScaledUploaded(img, canvasWidth) {
    //
    //   1920         x
    //   ---- = ---------------
    //   1080    windowHeight
    //
    
    var ratio = canvasWidth / img.width;
    
    return {
        width: img.width * ratio,
        height: img.height * ratio
    };
}


function _isMobile(){
    // if we want a more complete list use this: http://detectmobilebrowsers.com/
    // str.test() is more efficent than str.match()
    // remember str.test is case sensitive
    var isMobile = (/iphone|ipod|android|ie|blackberry|fennec/).test
         (navigator.userAgent.toLowerCase());
    return isMobile;
}

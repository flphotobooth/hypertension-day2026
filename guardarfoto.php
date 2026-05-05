<?php
    define('UPLOAD_DIR', '/images/');
    $img = $_POST['imgBase64'];
    $img = str_replace('data:image/png;base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $data = base64_decode($img);
    $file = UPLOAD_DIR . date("YmdHis") . rand(100,999) . '.png';
    $success = file_put_contents($file, $data);
    //send request to ocr 

    print $success ? $file : 'Unable to save the file.';
?>

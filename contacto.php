<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $turnstile_response = $_POST['cf-turnstile-response'] ?? '';
    if (empty($turnstile_response)) {
        http_response_code(400);
        echo json_encode(["status" => 400, "mensaje" => "Verificación de seguridad requerida."]);
        exit;
    }

    $secret_key = "0x4AAAAAAD89YQgUNqVm2abfwgmQtAz20q8";
    $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    $data = [
        'secret' => $secret_key,
        'response' => $turnstile_response
    ];
    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    $context  = stream_context_create($options);
    $verify = file_get_contents($url, false, $context);
    $captcha_success = json_decode($verify);
    
    // 3. Comprobar resultado
    if ($captcha_success->success == false) {
        http_response_code(400);
        echo json_encode(["status" => 400, "mensaje" => "Validación de seguridad fallida. Eres un bot."]);
        exit;
    }

    $nombre = $_POST['nombre'] ?? '';
    $respuesta = [
        "status" => 200,
        "mensaje" => "Hola $nombre, hemos recibido tu solicitud correctamente."
    ];
    http_response_code(200); 
    echo json_encode($respuesta);
    exit;
} else {
    http_response_code(405); 
    $error = [
        "status" => 405,
        "mensaje" => "Método no permitido. Este endpoint solo acepta solicitudes POST."
    ];
    echo json_encode($error);
    exit;
}
?>
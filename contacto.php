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
    
    if ($captcha_success->success == false) {
        http_response_code(400);
        echo json_encode(["status" => 400, "mensaje" => "Validación de seguridad fallida. Eres un bot."]);
        exit;
    }

    $nombre   = $_POST['nombre'] ?? 'Usuario';
    $empresa  = $_POST['empresa'] ?? 'No especificada';
    $telefono = $_POST['telefono'] ?? '';
    $correo   = $_POST['correo'] ?? '';
    $mensaje  = $_POST['mensaje'] ?? '';
    $payload = [
        "nombre"         => $nombre,
        "nombre_empresa" => $empresa,
        "email"          => $correo,
        "telefono"       => $telefono,
        "comentario"     => $mensaje
    ];
    $webhook_url = 'https://defaultcbe494a9b68e416f866c9b2d73319f.3d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/03/workflows/9dbee4b707774a2f9fc00c7cf95d6e14/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=93a3ouk7WseKP7GMwiMq1dit3UxmGEJAVawgKAt2fVU';

    $opciones_webhook = [
        'http' => [
            'header'  => "Content-Type: application/json\r\n", 
            'method'  => 'POST',
            'content' => json_encode($payload),
            'ignore_errors' => true 
        ]
    ];
    $contexto_webhook = stream_context_create($opciones_webhook);
    $resultado_webhook = file_get_contents($webhook_url, false, $contexto_webhook);
    $webhook_exitoso = false;
    $cabeceras_respuesta = http_get_last_response_headers();

    if ($resultado_webhook !== false && isset($cabeceras_respuesta)) {
        preg_match('{HTTP\/\S*\s(\d{3})}', $cabeceras_respuesta[0], $match);
        $status_code = $match[1] ?? 500;

        if ($status_code >= 200 && $status_code < 300) {
            $webhook_exitoso = true;
        }
    }
    if (!$webhook_exitoso) {
        http_response_code(500); 
        echo json_encode([
            "status" => 500, 
            "mensaje" => "Hubo un problema de conexión temporal al intentar enviar tu mensaje. Por favor, intenta de nuevo más tarde."
        ]);
        exit;
    }

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
<?php
/**
 * Authentication PHP Handler
 * Handles login and signup requests from the frontend
 */

// For production, disable error display to prevent HTML in JSON responses
error_reporting(E_ALL);
ini_set('display_errors', 0); // Changed to 0 to prevent HTML errors in JSON
ini_set('log_errors', 1);     // Log errors instead

// Set content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'test';  // Change this to your database name
$username = 'root';  // Change this to your database username
$password = '';  // Change this to your database password

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    response(false, 'Database connection failed: ' . $e->getMessage());
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Debug logging (remove in production)
error_log("Received input: " . $input);
error_log("Decoded data: " . print_r($data, true));

// Validate JSON input
if (!$data) {
    error_log("JSON decode failed. JSON error: " . json_last_error_msg());
    response(false, 'Invalid JSON data: ' . json_last_error_msg());
}

// Get the action
$action = $data['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin($pdo, $data);
        break;
    case 'getuser':
        handleuser($pdo, $data);
        break;
    default:
        response(false, 'Invalid action');
}

function handleLogin($pdo, $data) {
    // Validate required fields
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        response(false, 'Username and password are required');
    }
    
    try {
        // Find user by username
        $stmt = $pdo->prepare("SELECT uid, user_name,organization, pwd FROM profile_data WHERE user_name = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if (!$user) {
            response(false, 'Invalid username or password');
        }
        
        // Verify password
        if (!password_verify($password, $user['pwd'])) {
            response(false, 'Invalid username or password');
        }
        
        // Start session and set user data
        session_start();
        $_SESSION['user_id'] = $user['uid'];
        $_SESSION['username'] = $user['user_name'];
        $_SESSION['organization'] = $user['organization'] ?? '';
        $_SESSION['logged_in'] = true;
        
        // Update last login time (optional)
        $stmt = $pdo->prepare("UPDATE profile_data SET last_login = NOW() WHERE uid = ?");
        $stmt->execute([$user['uid']]);
        
        response(true, 'Login successful', [
            'user_id' => $user['uid'],
            'username' => $user['user_name']
        ]);
        
    } catch (PDOException $e) {
        response(false, 'Database error: ' . $e->getMessage());
    }
}
/**
 * Handle fetching current user info
 */
function handleuser($pdo, $data) {
    session_start();
     error_log("Session data: " . print_r($_SESSION, true));
    if (isset($_SESSION['username'])) {
        $username = $_SESSION['username'];
        $org = $_SESSION['organization'] ?? '';
        response(true, 'User fetched successfully', [
            'username' => $username,
            'organization' => $org
        ]);
    } else {
        response(false, 'No user logged in');
    }
}
/**
 * Send JSON response
 */
function response($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}
?>
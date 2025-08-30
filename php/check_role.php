<?php
session_start();
include "dbconnect.php";
header('Content-Type: application/json');
$org = $_SESSION['organization'];
// DB connection
$mysqli = opencon();
if (mysqli_connect_errno()) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$roleName = trim($_GET['role'] ?? '');

if ($roleName === '') {
    echo json_encode(['exists' => false, 'matches' => []]);
    exit;
}

// Exact match check
$stmt = mysqli_prepare($mysqli, "SELECT role_id FROM abc_roles_data WHERE role_name = ?");
mysqli_stmt_bind_param($stmt, "s", $roleName);
mysqli_stmt_execute($stmt); 
mysqli_stmt_bind_result($stmt, $role_id);
$exists = mysqli_stmt_fetch($stmt);
mysqli_stmt_close($stmt);

// Partial match for suggestions
$like = '%' . $roleName . '%';
$stmt2 = mysqli_prepare($mysqli, "SELECT role_id, role_name FROM abc_roles_data WHERE role_name LIKE ?");
mysqli_stmt_bind_param($stmt2, "s", $like);
mysqli_stmt_execute($stmt2);
$result = mysqli_stmt_get_result($stmt2);
$matches = [];
while ($row = mysqli_fetch_assoc($result)) {
    $matches[] = $row;
}
mysqli_stmt_close($stmt2);

echo json_encode([
    'exists' => (bool)$exists,
    'role_id' => $exists ? $role_id : null,
    'matches' => $matches
]);

mysqli_close($mysqli);
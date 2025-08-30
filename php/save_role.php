<?php
header('Content-Type: application/json');
include 'dbconnect.php';

// Open DB connection
$mysqli = opencon();
if (mysqli_connect_errno()) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Get role name from POST
$roleName = trim($_POST['roleName'] ?? '');
if ($roleName === '') {
    echo json_encode(['success' => false, 'message' => 'Role name is required']);
    exit;
}

// Check if role exists
$stmt = mysqli_prepare($mysqli, "SELECT role_id FROM abc_roles_data WHERE role_name = ?");
mysqli_stmt_bind_param($stmt, "s", $roleName);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);

if (mysqli_stmt_num_rows($stmt) > 0) {
    mysqli_stmt_close($stmt);
    mysqli_close($mysqli);
    echo json_encode(['success' => false, 'message' => 'Role name already exists. Please choose another name.']);
    exit;
}
mysqli_stmt_close($stmt);

// Insert new role
$stmt = mysqli_prepare($mysqli, "INSERT INTO abc_roles_data (role_name) VALUES (?)");
mysqli_stmt_bind_param($stmt, "s", $roleName);
if (mysqli_stmt_execute($stmt)) {
    // Get inserted role ID
    $stmt2 = mysqli_prepare($mysqli, "SELECT role_id FROM abc_roles_data WHERE role_name = ?");
    mysqli_stmt_bind_param($stmt2, "s", $roleName);
    mysqli_stmt_execute($stmt2);
    $result = mysqli_stmt_get_result($stmt2);
    $row = mysqli_fetch_assoc($result);
    $new_role_id = $row['role_id'];
    mysqli_stmt_close($stmt2);

    echo json_encode(['success' => true, 'message' => "Role '$roleName' created successfully (ID: $new_role_id)"]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error creating role. Please try again.']);
}
mysqli_stmt_close($stmt);
mysqli_close($mysqli);

<?php
    function opencon(){
        $servername = "localhost";
        $username = "root";
        $password = "";
        $database = "test";
        $conn = new mysqli($servername, $username, $password, $database);

        return $conn;
    }
    function closeconn($conn){
        $conn->close();   
    }
?>
<html>
<body>
<?php
include('connection.php');
if(isset($_GET['userId']))
{
$id=$_GET['userId'];
$query1=mysql_query("delete from  users2 where userId='$id'");
if($query1)
{
header('location:viewuser.php');
}
}
?>
</body>
</html>
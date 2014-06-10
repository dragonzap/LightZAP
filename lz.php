<?php
if (isset($_GET['p']))
{
	header('Content-Description: File Transfer');
	header("Content-type: application/octet-stream");
	header("Content-disposition: attachment; filename= ".$_GET['p']."");
	readfile($_GET['p']);
}
?>

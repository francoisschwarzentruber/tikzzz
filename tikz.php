 <?php

 
 
/*
input:
- filename: a filename (with directory information, with extension)
output: the content of the file filename as a string
*/
function fileread($filename)
{
	$handle = fopen($filename, "r");
	$str = fread($handle, filesize($filename)); 
	fclose($handle);
	
	return $str;
}


/*
input:
- filename: a filename (with directory information, with extension)
- data: a string

WRITE the content data in the file filename
*/
function filewrite($filename, $data)
{
	$handle = fopen($filename, 'w');
	fwrite($handle, $data);
	fclose($handle);
}
 
 
 
 
 
 
 
/**
 * Execute a command and kill it if the timeout limit fired to prevent long php execution
 * 
 * @see http://stackoverflow.com/questions/2603912/php-set-timeout-for-script-with-system-call-set-time-limit-not-working
 * 
 * @param string $cmd Command to exec (you should use 2>&1 at the end to pipe all output)
 * @param integer $timeout
 * @return string Returns command output 
 */
function exec_timeout($cmd, $timeout=5) {
 
  $descriptorspec = array(
      0 => array("pipe", "r"),
      1 => array("pipe", "w"),
      2 => array("pipe", "w")
  );
  $pipes = array();
 
  $timeout += time();
  $process = proc_open($cmd, $descriptorspec, $pipes);
  if (!is_resource($process)) {
    throw new Exception("proc_open failed on: " . $cmd);
  }
 
  $output = '';
 
  do {
    $timeleft = $timeout - time();
    $read = array($pipes[1]);
    stream_select($read, $write = NULL, $exeptions = NULL, $timeleft, NULL);
 
    if (!empty($read)) {
      $output .= fread($pipes[1], 8192);
    }
  } while (!feof($pipes[1]) && $timeleft > 0);
 
  if ($timeleft <= 0) {
    proc_terminate($process);
    throw new Exception("command timeout on: " . $cmd);
  } else {
    return $output;
  }
}
 
 
 
 $trueiffinalversiontodownload = false;
 
 
 
 
 
 
/*
input: a LaTEX file (without directory information and without extension)
(but such a file exists in the directory tmp and with the extension ".tex")
output: compile the file and generate a pdf and an image .png of the pdf
*/
function compileAndGenerateImage($latexfilename)
{
        chdir("tmp");
        
        
        
        if(file_exists("$latexfilename.svg"))
	     unlink("$latexfilename.svg");
	     
	exec_timeout("pdflatex -interaction=nonstopmode -shell-escape $latexfilename.tex", 5);
	
	if(!file_exists("$latexfilename.svg"))
	{
	    if(!file_exists("$latexfilename.log"))
	    {
	         echo("no .log file");
	    }
	     echo fileread("$latexfilename.log");
	}
	  

	
	
	
	
	chdir("..");

}

/*
input: the latexcode of an exercice typically a "\begin{exercice}.... \end{exercice}\begin{correction}...\begin{correction}" string
output: the code of a document containing the exercice and such that the result of a LaTEX compilation is a pdf or png whose size of the page crop the exercice
*/
function getLaTEXCodeFromOneTikzCrop($latexcode)
{
	$str = fileread("latexheader.tex") .
		"\\begin{document}\n";
		
	
	$str .= $latexcode;
	
	$str .= "\n\n \\end{document}";
	
	return $str;
}





/*
input: latex code of an exercice (typically a "\begin{exercice}.... \end{exercice}\begin{correction}...\begin{correction}" 
WRITE the content of a real document that crop the page to the exercice
return the name of the file (without directory information and without extension) containing this document LaTEX code
  this file is in the directory tmp
*/
function producedottex($latexcode, $latexfilename)
{
	$mytmpfile = "tmp/$latexfilename.tex";
	filewrite($mytmpfile, getLaTEXCodeFromOneTikzCrop($latexcode));
}












session_start();


$id = session_id();




$code = $_POST["code"];
$trueiffinalversiontodownload = $_POST["trueiffinalversiontodownload"];

set_time_limit(2);



if(!isset($code))
{
  echo "no code was given : $code";
  exit;
}



if($trueiffinalversiontodownload != "true")
{
     $latexfilename = "tmp$id";
}
else
{
     $latexfilename = "tmptodownload$id";
}
producedottex($code, $latexfilename);
compileAndGenerateImage($latexfilename);

echo("tmp/$latexfilename");
?>
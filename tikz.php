 <?php

  /**
   * Execute a command and kill it if the timeout limit fired to prevent long php execution
   * 
   * @see http://stackoverflow.com/questions/2603912/php-set-timeout-for-script-with-system-call-set-time-limit-not-working
   * 
   * @param string $cmd Command to exec (you should use 2>&1 at the end to pipe all output)
   * @param integer $timeout
   * @return string Returns command output 
   */
  function exec_timeout($cmd, $timeout = 5)
  {

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






  /**
   * @returns whether a file is old, i.e. more than 20sec!
   */
  function is_old_file($file)
  {
    return filemtime($file) < time() - 20;
  }



  /**
   * @returns true if $haystack finishes with $needle
   */
  function endsWith($haystack, $needle)
  {
    $length = strlen($needle);
    if (!$length) {
      return true;
    }
    return substr($haystack, -$length) === $needle;
  }



  /**
   * remove too old files
   */
  function clean()
  {
    $files = glob('*'); // get all file names
    foreach ($files as $file) { // iterate files
      if (is_file($file) && is_old_file($file) && (endsWith($file, ".log") || endsWith($file, ".tex") || endsWith($file, ".pdf") || endsWith($file, ".aux"))) {
        unlink($file); // delete file
      }
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
    if (file_exists("$latexfilename.svg"))
      unlink("$latexfilename.svg");

    exec_timeout("pdflatex -interaction=nonstopmode -shell-escape $latexfilename.tex", 5);

    if (!file_exists("$latexfilename.svg")) {
      if (!file_exists("$latexfilename.log")) {
        echo ("no .log file\n");
      }
      echo file_get_contents("$latexfilename.log");
    }

    clean();
    
    chdir("..");
  }

  /*
input: the latexcode of an exercice typically a "\begin{exercice}.... \end{exercice}\begin{correction}...\begin{correction}" string
output: the code of a document containing the exercice and such that the result of a LaTEX compilation is a pdf or png whose size of the page crop the exercice
*/
  function getLaTEXCodeFromOneTikzCrop($latexcode)
  {
    $str = file_get_contents("latexheader.tex") . "\\begin{document}\n";
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
    $finalCode = getLaTEXCodeFromOneTikzCrop($latexcode);
    file_put_contents($mytmpfile, $finalCode);
  }



  session_start();
  $id = session_id();
  $code = $_POST["code"];
  $trueiffinalversiontodownload = $_POST["trueiffinalversiontodownload"];

  set_time_limit(2);

  if (!isset($code)) {
    echo "no code was given : $code";
    exit;
  }

  if ($trueiffinalversiontodownload != "true") {
    $latexfilename = "tmp$id";
  } else {
    $latexfilename = "tmptodownload$id";
  }
  producedottex($code, $latexfilename);
  compileAndGenerateImage($latexfilename);

  echo ("\ntmp/$latexfilename");
  ?>
#!/usr/bin/php
<?php

$files = ['index.html'];
$dirs = ['pages/de/'];

foreach($dirs as $dir) {
    $d = dir($dir);
    while (false !== ($entry = $d->read())) {
        if (is_file($dir . $entry)) {
            $files[] = $dir . $entry;
        }
    }
    $d->close();
}

$header = file_get_contents('src/partial-header.html');
$footer = file_get_contents('src/partial-footer.html');

foreach ($files as $file) {
    $content = file_get_contents($file);
    preg_match_all('/<!-- CONTENT START -->(.*)<!-- CONTENT END -->/s', $content, $matches, PREG_SET_ORDER, 0);
    $content = $matches[0] ?? [];
    $content = $content[1] ?? [];
    if(empty($content)) {
        echo "{$file} hat <!-- CONTENT START --> oder <!-- CONTENT END --> nicht richtig implementiert.\n";
        continue;
    }
    $content = $header . $content . $footer;
    file_put_contents($file, $content);
}

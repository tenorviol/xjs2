xjs
===

TODO

    <?js
      
      function userName(uid) {
        var async = out.async();
        lookupName(uid, function (name) {
          out.write(<a href={"/profile?id="+uid}><?= name ?></a>);
          async.end();
        });
      }
    
    ?>
    <ul>
      <?js
        uids.forEach(function (uid) {
          out.write(<li><?= userName(uid) ?></li>);
        });
      ?>
    </ul>

if (typeof jQuery === 'undefined') {
  console.log('[v0] jQuery not loaded, waiting...');
  setTimeout(function() {
    if (typeof jQuery !== 'undefined') {
      initApp();
    }
  }, 500);
} else {
  initApp();
}

function initApp() {
  var $ = jQuery;
  var windowWidth = 0;

  function toggleMenu(){
    $('#nav').slideToggle(200);
  }

  function closeMenuOnClick(){
    if (windowWidth < 768) { $('#nav').slideUp(200); }
  }

  function handleResize(){
    var newWidth = $(window).width();
    if (newWidth >= 768) {
      $('#nav').show();
      $('#burger').hide();
      $('body').removeClass('mobile');
    }
    if (newWidth < 768) {
      $('#nav').hide();
      $('#burger').show();
      $('body').addClass('mobile');
    }
    windowWidth = newWidth;
  }

  function Carousel($root){
    this.$root = $root;
    this.$slides = $root.find('.slide');
    this.index = 0;
    this.autoplayTimer = null;
    this.createDots();
    this.show(this.index);
    this.startAutoplay();
  }
  Carousel.prototype.createDots = function(){
    var $dots = this.$root.find('.carousel-dots');
    for (var i=0;i<this.$slides.length;i++){
      var $dot = $('<span></span>');
      if (i===0) $dot.addClass('active');
      var self = this;
      ;(function(idx){ 
        $dot.click(function(e){ 
          e.preventDefault(); 
          self.stopAutoplay();
          self.goTo(idx); 
          self.startAutoplay();
        }); 
      })(i);
      $dots.append($dot);
    }
  };
  Carousel.prototype.updateDots = function(){
    var $dots = this.$root.find('.carousel-dots span');
    $dots.removeClass('active').eq(this.index).addClass('active');
  };
  Carousel.prototype.show = function(i){
    this.$slides.removeClass('active').hide();
    var $current = $(this.$slides[i]).addClass('active').show();
    var $img = $current.find('img.lazy');
    if ($img.length){ loadImage($img); }
    this.updateDots();
  };
  Carousel.prototype.next = function(){ 
    this.index = (this.index+1) % this.$slides.length; 
    this.show(this.index); 
  };
  Carousel.prototype.prev = function(){ 
    this.index = (this.index-1+this.$slides.length) % this.$slides.length; 
    this.show(this.index); 
  };
  Carousel.prototype.goTo = function(i){ 
    this.index = i; 
    this.show(this.index); 
  };
  Carousel.prototype.startAutoplay = function(){
    var self = this;
    this.autoplayTimer = setInterval(function(){
      self.next();
    }, 4500);
  };
  Carousel.prototype.stopAutoplay = function(){
    if (this.autoplayTimer){
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  function loadReviews(){
    try { 
      var raw = window.localStorage ? localStorage.getItem('reviews_v1') : null; 
      return raw ? JSON.parse(raw) : []; 
    }catch(e){ 
      return []; 
    }
  }
  function saveReviews(arr){
    try { 
      if(window.localStorage){ 
        localStorage.setItem('reviews_v1', JSON.stringify(arr)); 
      } 
    }catch(e){}
  }
  function appendReview(name, rating, comment, experience, likes, pains){
    var reviews = loadReviews();
    reviews.unshift({ 
      name:name, 
      rating:parseInt(rating,10), 
      comment:comment, 
      experience:experience||'', 
      likes:likes||[], 
      pains:pains||[], 
      ts:new Date().toISOString() 
    });
    if (reviews.length>100) reviews.pop();
    saveReviews(reviews); 
    renderReviews(reviews); 
    renderStats(reviews);
  }
  function escapeHtml(s){
    if(!s && s!==0){return ''}
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function renderReviews(reviews){
    var $ul = $('#reviews-list').empty();
    if (reviews.length===0){ 
      $ul.append('<li style="color:#666;font-style:italic;">Aucun avis. Soyez le premier.</li>'); 
      return; 
    }
    for (var i=0;i<reviews.length && i<20;i++){
      var it = reviews[i];
      var stars=''; 
      for(var s=0;s<it.rating;s++){ 
        stars+='★'; 
      }
      var extras = '';
      if (it.experience){ 
        extras += '<br><em>Expérience:</em> ' + escapeHtml(it.experience); 
      }
      if (it.likes && it.likes.length){ 
        extras += '<br><em>Aime:</em> ' + escapeHtml((it.likes.join?it.likes.join(', '):String(it.likes))); 
      }
      if (it.pains && it.pains.length){ 
        extras += '<br><em>Difficultés:</em> ' + escapeHtml((it.pains.join?it.pains.join(', '):String(it.pains))); 
      }
      var li = '<li><strong>' + escapeHtml(it.name) + '</strong> ' + stars + ' ' + it.rating + '/5<br>' + escapeHtml(it.comment||'') + extras + '</li>';
      $ul.append(li);
    }
  }
  function renderStats(reviews){
    var count = reviews.length, sum = 0, hist = {1:0,2:0,3:0,4:0,5:0};
    for (var i=0;i<reviews.length;i++){ 
      var r = parseInt(reviews[i].rating,10); 
      if(r>=1 && r<=5){ 
        sum+=r; 
        hist[r]++; 
      } 
    }
    var avg = count ? Math.round((sum/count)*10)/10 : 0;
    $('#stat-count').text(count); 
    $('#stat-avg').text(avg.toFixed(1));
    var total = count || 1;
    for (var k=1;k<=5;k++){ 
      var w = Math.round((hist[k]/total)*100); 
      $('#h'+k).css('width', w+'%'); 
    }
  }

  // API helpers
  function apiInitDb(){
    $.getJSON('api/init_db.php').always(function(){});
  }
  function fetchReviews(){
    $.getJSON('api/get_reviews.php')
      .done(function(res){
        var arr = (res && res.reviews) ? res.reviews.map(function(it){
          it.rating = parseInt(it.rating, 10);
          try {
            if (typeof it.likes === 'string') {
              it.likes = it.likes ? it.likes.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : [];
            }
            if (typeof it.pains === 'string') {
              it.pains = it.pains ? it.pains.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : [];
            }
          } catch(e) {}
          return it;
        }) : [];
        renderReviews(arr);
      })
      .fail(function(){
        renderReviews([]);
      });
  }
  function fetchStats(){
    $.getJSON('api/get_stats.php')
      .done(function(res){
        var count = parseInt((res && res.count) ? res.count : 0, 10);
        var avg = parseFloat((res && res.avg) ? res.avg : 0);
        $('#stat-count').text(count);
        $('#stat-avg').text(isNaN(avg)?'0.0':avg.toFixed(1));
        var hist = (res && res.hist) ? res.hist : {1:0,2:0,3:0,4:0,5:0};
        var total = count || 1;
        for (var k=1;k<=5;k++){
          var w = Math.round((((hist[k]||0)/total)*100));
          $('#h'+k).css('width', w+'%');
        }
      })
      .fail(function(){
        $('#stat-count').text('0');
        $('#stat-avg').text('0.0');
        for (var k=1;k<=5;k++){ $('#h'+k).css('width','0%'); }
      });
  }

  function bindTabs(){
    $('#course-tabs .tabs-nav a').click(function(e){
      e.preventDefault();
      var target = $(this).attr('href');
      $('#course-tabs .tabs-nav li').removeClass('active'); 
      $(this).parent().addClass('active');
      $('#course-tabs .tab-pane').removeClass('active').hide(); 
      $(target).addClass('active').show();
    });
  }
  function bindGallery(){
    $('#gallery .thumb').click(function(){
      var $t = $(this);
      var real = $t.attr('data-src') || $t.attr('src');
      if ($t.hasClass('lazy')){ loadImage($t); }
      $('#lightbox-img').attr('src', real);
      $('#lightbox').show(); 
      $('body').css('overflow','hidden'); 
      return false;
    });
    $('#lightbox-close').click(function(e){ 
      e.preventDefault(); 
      closeLightbox(); 
    });
    $(document).keyup(function(e){ 
      if (e.keyCode===27){ 
        closeLightbox(); 
      } 
    });
    $('#lightbox').click(function(e){ 
      if (e.target === this){ 
        closeLightbox(); 
      } 
    });
  }
  function closeLightbox(){ 
    $('#lightbox').hide(); 
    $('body').css('overflow','auto'); 
  }

  function inViewport($el, threshold){
    var $w = $(window);
    var st = $w.scrollTop();
    var wh = $w.height();
    var et = $el.offset().top;
    var eh = $el.height() || 0;
    threshold = threshold || 200;
    return (et < st + wh + threshold) && (et + eh > st - threshold);
  }
  function loadImage($img){
    var src = $img.attr('data-src');
    if (src){
      $img.attr('src', src);
      $img.removeAttr('data-src');
      $img.removeClass('lazy');
    }
  }
  function lazyCheck(){
    $('img.lazy').each(function(){
      var $img = $(this);
      if (inViewport($img, 250)){
        loadImage($img);
      }
    });
  }

  $(function(){
    windowWidth = $(window).width();

    $('#burger').click(function(e){ 
      e.preventDefault(); 
      toggleMenu(); 
    });
    
    $('.nav-btn').click(function(e){ 
      e.preventDefault();
      closeMenuOnClick();
      var target = $(this).attr('data-target');
      if (target && $(target).length) {
        $('html, body').animate({ scrollTop: $(target).offset().top - 80 }, 600);
      }
    });

    var carousel = new Carousel($('#carousel'));

    bindTabs(); 
    bindGallery();

    apiInitDb();

    var savedTheme=null; 
    try { 
      savedTheme = window.localStorage ? localStorage.getItem('theme') : null; 
    }catch(e){}
    var currentTheme = savedTheme==='night' ? 'night' : 'day';
    
    function applyTheme(theme){
      if(theme==='night'){ 
        $('body').addClass('night'); 
        $('#theme-toggle').text('☼ Jour'); 
      }
      else { 
        $('body').removeClass('night'); 
        $('#theme-toggle').text('☾ Nuit'); 
      }
    }
    
    applyTheme(currentTheme);
    $('#theme-toggle').click(function(e){
      e.preventDefault();
      currentTheme = (currentTheme==='night')?'day':'night';
      applyTheme(currentTheme);
      try{ 
        if(window.localStorage){ 
          localStorage.setItem('theme', currentTheme); 
        } 
      }catch(e){}
    });

    $('#review-form').submit(function(e){
      e.preventDefault();
      var name = $('#name').val().trim();
      var rating = $('#rating').val();
      var comment = $('#comment').val().trim();
      var experience = $('#experience').val();
      var consent = $('#consent').is(':checked');
      
      var likes = [];
      $('input[name="likes"]:checked').each(function(){ 
        likes.push($(this).val()); 
      });
      
      var pains = [];
      $('input[name="pains"]:checked').each(function(){ 
        pains.push($(this).val()); 
      });
      
      if(!consent){ 
        alert('Veuillez accepter les conditions.'); 
        return; 
      }
      if(!name){ 
        alert('Veuillez entrer votre nom.'); 
        return; 
      }
      if(!rating){ 
        alert('Veuillez donner une note.'); 
        return; 
      }
      var payload = {
        name: name,
        rating: rating,
        comment: comment,
        experience: experience,
        likes: likes.join(','),
        pains: pains.join(',')
      };
      $.ajax({
        url: 'api/save_review.php',
        method: 'POST',
        data: payload,
        dataType: 'json'
      })
      .done(function(resp){
        if (resp && resp.ok){
          $('#review-form')[0].reset();
          $('#form-msg').text('Merci pour votre avis !').show().delay(3000).fadeOut();
          fetchReviews();
          fetchStats();
        } else {
          alert('Erreur: impossible d\'enregistrer.');
        }
      })
      .fail(function(){
        alert('Erreur réseau ou serveur.');
      });
    });

    fetchReviews();
    fetchStats();

    handleResize();
    $(window).resize(function(){ 
      handleResize(); 
      lazyCheck(); 
    });

    $(window).on('scroll', function(){ 
      lazyCheck(); 
    });
    lazyCheck();
  });
}

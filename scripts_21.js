;(function($){
  var windowWidth = 0

  function toggleMenu(){
    var $nav = $('#nav')
    if ($nav.is(':visible')) { $nav.slideUp(200) } else { $nav.slideDown(200) }
  }

  function closeMenuOnClick(){
    if (windowWidth < 768) { $('#nav').slideUp(200) }
  }

  function handleResize(){
    var newWidth = $(window).width()
    if (newWidth >= 768) {
      $('#nav').show()
      $('#burger').hide()
      $('body').removeClass('mobile')
    }
    if (newWidth < 768) {
      $('#nav').hide()
      $('#burger').show()
      $('body').addClass('mobile')
    }
    windowWidth = newWidth
  }

  // Icon replacement removed: keep full labels for clarity on mobile

  function Carousel($root){
    this.$root = $root
    this.$slides = $root.find('.slide')
    this.index = 0
    this.createDots()
    this.show(this.index)
  }
  Carousel.prototype.createDots = function(){
    var $dots = this.$root.find('.carousel-dots')
    for (var i=0;i<this.$slides.length;i++){
      var $dot = $('<span></span>')
      if (i===0) $dot.addClass('active')
      var self = this
      ;(function(idx){ $dot.click(function(){ self.goTo(idx) }) })(i)
      $dots.append($dot)
    }
  }
  Carousel.prototype.updateDots = function(){
    var $dots = this.$root.find('.carousel-dots span')
    $dots.removeClass('active').eq(this.index).addClass('active')
  }
  Carousel.prototype.show = function(i){
    this.$slides.removeClass('active').hide()
    var $current = $(this.$slides[i]).addClass('active').show()
    // Ensure current slide image is loaded even if lazy
    var $img = $current.find('img.lazy')
    if ($img.length){ loadImage($img) }
    this.updateDots()
  }
  Carousel.prototype.next = function(){ this.index = (this.index+1) % this.$slides.length; this.show(this.index) }
  Carousel.prototype.prev = function(){ this.index = (this.index-1+this.$slides.length) % this.$slides.length; this.show(this.index) }
  Carousel.prototype.goTo = function(i){ this.index = i; this.show(this.index) }

  function loadReviews(){
    try{ var raw = window.localStorage ? localStorage.getItem('legacy_reviews_v1') : null; return raw ? JSON.parse(raw) : [] }catch(e){ return [] }
  }
  function saveReviews(arr){ try{ if(window.localStorage){ localStorage.setItem('legacy_reviews_v1', JSON.stringify(arr)) } }catch(e){}
  }
  function fetchAndRenderReviews(){
    $.getJSON('api/get_reviews.php')
      .done(function(data){ var reviews = $.isArray(data && data.reviews) ? data.reviews : []; renderReviews(reviews); renderStats(reviews) })
      .fail(function(){ var reviews = loadReviews(); renderReviews(reviews); renderStats(reviews) })
  }
  function appendReview(name, rating, comment, experience, likes, pains){
    var reviews = loadReviews()
    reviews.unshift({ name:name, rating:parseInt(rating,10), comment:comment, experience:experience||'', likes:likes||[], pains:pains||[], ts:new Date().toISOString() })
    if (reviews.length>100) reviews.pop()
    saveReviews(reviews); renderReviews(reviews); renderStats(reviews)
  }
  function escapeHtml(s){ if(!s && s!==0){return ''} return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;') }
  function renderReviews(reviews){
    var $ul = $('#reviews-list').empty()
    if (reviews.length===0){ $ul.append('<li style="color:#666;font-style:italic;">Aucun avis. Soyez le premier.</li>'); return }
    for (var i=0;i<reviews.length && i<20;i++){
      var it = reviews[i]
      var stars=''; for(var s=0;s<it.rating;s++){ stars+='★' }
      var extras=''
      if (it.experience){ extras += '<br><em>Expérience:</em> ' + escapeHtml(it.experience) }
      if (it.likes && it.likes.length){ extras += '<br><em>Aime:</em> ' + escapeHtml((it.likes.join?it.likes.join(', '):String(it.likes))) }
      if (it.pains && it.pains.length){ extras += '<br><em>Difficultés:</em> ' + escapeHtml((it.pains.join?it.pains.join(', '):String(it.pains))) }
      var li = '<li><strong>' + escapeHtml(it.name) + '</strong> — <span>' + stars + '</span> ' + it.rating + '/5<br>' + escapeHtml(it.comment||'') + extras + '</li>'
      $ul.append(li)
    }
  }
  function renderStats(reviews){
    var count = reviews.length, sum = 0, hist = {1:0,2:0,3:0,4:0,5:0}
    for (var i=0;i<reviews.length;i++){ var r = parseInt(reviews[i].rating,10); if(r>=1 && r<=5){ sum+=r; hist[r]++ } }
    var avg = count ? Math.round((sum/count)*10)/10 : 0
    $('#stat-count').text(count); $('#stat-avg').text(avg.toFixed(1))
    var total = count || 1
    for (var k=1;k<=5;k++){ var w = Math.round((hist[k]/total)*100); $('#h'+k).css('width', w+'%') }
  }

  function bindTabs(){
    $('#course-tabs .tabs-nav a').click(function(e){
      e.preventDefault()
      var target = $(this).attr('href')
      $('#course-tabs .tabs-nav li').removeClass('active'); $(this).parent().addClass('active')
      $('#course-tabs .tab-pane').removeClass('active').hide(); $(target).addClass('active').show()
    })
  }
  function bindGallery(){
    $('#gallery .thumb').click(function(){
      var $t = $(this)
      // Prefer real source if still lazy
      var real = $t.attr('data-src') || $t.attr('src')
      if ($t.hasClass('lazy')){ loadImage($t) }
      $('#lightbox-img').attr('src', real)
      $('#lightbox').show(); $('body').css('overflow','hidden'); return false
    })
    $('#lightbox-close').click(function(e){ e.preventDefault(); closeLightbox() })
    $(document).keyup(function(e){ if (e.keyCode===27){ closeLightbox() } })
    $('#lightbox').click(function(e){ if (e.target === this){ closeLightbox() } })
  }
  function closeLightbox(){ $('#lightbox').hide(); $('body').css('overflow','auto') }

  function bindSmoothScroll(){
    $('a[href^="#"]').not('.tabs-nav a').click(function(e){
      var target = $(this).attr('href'); if (target==='#') return; var $t=$(target); if($t.length){ e.preventDefault(); window.location.hash = target.substring(1) }
    })
  }

  function applyTheme(theme){ if(theme==='night'){ $('body').addClass('night') } else { $('body').removeClass('night') } }
  function updateToggleIcon(theme){
    var $btn = $('#theme-toggle')
    if (!$btn.length) return
    $btn.attr('title', theme==='night'?'Mode jour':'Mode nuit')
    $btn.text(theme==='night' ? '☼' : '☾')
  }

  // Lazy loading for images (HTML4/jQuery1 compatible)
  function inViewport($el, threshold){
    var $w = $(window)
    var st = $w.scrollTop()
    var wh = $w.height()
    var et = $el.offset().top
    var eh = $el.height() || 0
    threshold = threshold || 200
    return (et < st + wh + threshold) && (et + eh > st - threshold)
  }
  function loadImage($img){
    var src = $img.attr('data-src')
    if (src){
      $img.attr('src', src)
      $img.removeAttr('data-src')
      $img.removeClass('lazy')
    }
  }
  function lazyCheck(){
    $('img.lazy').each(function(){
      var $img = $(this)
      if (inViewport($img, 250)){
        loadImage($img)
      }
    })
  }

  $(function(){
    windowWidth = $(window).width()

    $('#burger').click(function(e){ e.preventDefault(); toggleMenu() })
    $('.nav a').click(function(){ closeMenuOnClick() })

    var carousel = new Carousel($('#carousel'))
    $('#next').click(function(e){ e.preventDefault(); carousel.next() })
    $('#prev').click(function(e){ e.preventDefault(); carousel.prev() })

    bindTabs(); bindGallery(); bindSmoothScroll(); fetchAndRenderReviews()

    var savedTheme=null; try{ savedTheme = window.localStorage ? localStorage.getItem('theme') : null }catch(e){}
    var currentTheme = savedTheme==='night' ? 'night' : 'day'
    applyTheme(currentTheme); updateToggleIcon(currentTheme)
    $('#theme-toggle').click(function(e){ e.preventDefault(); currentTheme = (currentTheme==='night')?'day':'night'; applyTheme(currentTheme); updateToggleIcon(currentTheme); try{ if(window.localStorage){ localStorage.setItem('theme', currentTheme) } }catch(e){} })

    handleResize()
    $(window).resize(function(){ handleResize(); lazyCheck() })

    // Setup lazy loading
    $(window).on('scroll', function(){ lazyCheck() })
    // Initial check
    lazyCheck()
  })
})(window.jQuery)

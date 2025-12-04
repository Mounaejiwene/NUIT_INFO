;(($) => {
  var windowWidth = $(window).width()

  function toggleMenu() {
    $("#nav").slideToggle(200)
  }

  function closeMenuOnClick() {
    if (windowWidth < 768) {
      $("#nav").slideUp(200)
    }
  }

  function handleResize() {
    var newWidth = $(window).width()

    if (newWidth >= 768 && windowWidth < 768) {
      $("#nav").show()
    }

    if (newWidth < 768 && windowWidth >= 768) {
      $("#nav").hide()
    }

    windowWidth = newWidth
  }

  function Carousel($root) {
    this.$root = $root
    this.$slides = $root.find(".slide")
    this.index = 0
    this.autoplayInterval = null
    this.createDots()
    this.show(this.index)
  }

  Carousel.prototype.createDots = function () {
    var $dots = this.$root.find(".carousel-dots")

    for (var i = 0; i < this.$slides.length; i++) {
      var $dot = $("<span></span>")
      if (i === 0) $dot.addClass("active")
      ;((idx) => {
        $dot.click(() => {
          this.goTo(idx)
        })
      })(i)

      $dots.append($dot)
    }
  }

  Carousel.prototype.updateDots = function () {
    this.$root.find(".carousel-dots span").removeClass("active").eq(this.index).addClass("active")
  }

  Carousel.prototype.show = function (i) {
    this.$slides.removeClass("active").hide()
    $(this.$slides[i]).addClass("active").fadeIn(250)
    this.updateDots()
  }

  Carousel.prototype.next = function () {
    this.index = (this.index + 1) % this.$slides.length
    this.show(this.index)
  }

  Carousel.prototype.prev = function () {
    this.index = (this.index - 1 + this.$slides.length) % this.$slides.length
    this.show(this.index)
  }

  Carousel.prototype.goTo = function (idx) {
    this.index = idx
    this.show(this.index)
  }

  Carousel.prototype.startAutoplay = function () {
    this.autoplayInterval = setInterval(() => {
      this.next()
    }, 5000)
  }

  Carousel.prototype.stopAutoplay = function () {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval)
    }
  }

  var STORAGE_KEY = "legacy_reviews_v1"

  function loadReviews() {
    try {
      var raw = window.localStorage ? localStorage.getItem(STORAGE_KEY) : null
      if (!raw) {
        return []
      }
      var arr = JSON.parse(raw)
      return $.isArray(arr) ? arr : []
    } catch (e) {
      return []
    }
  }

  function saveReviews(arr) {
    try {
      if (window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
      }
    } catch (e) {}
  }

  function fetchAndRenderReviews() {
    $.getJSON("api/get_reviews.php")
      .done(function (data) {
        var reviews = $.isArray(data && data.reviews) ? data.reviews : []
        renderReviews(reviews)
        renderStats(reviews)
      })
      .fail(function () {
        var reviews = loadReviews()
        renderReviews(reviews)
        renderStats(reviews)
      })
  }

  function appendReview(name, rating, comment, experience, likes, pains) {
    var reviews = loadReviews()
    reviews.unshift({
      name: name,
      rating: Number.parseInt(rating, 10),
      comment: comment,
      experience: experience || "",
      likes: $.isArray(likes) ? likes : likes ? [likes] : [],
      pains: $.isArray(pains) ? pains : pains ? [pains] : [],
      ts: new Date().toISOString(),
    })
    if (reviews.length > 100) {
      reviews.pop()
    }
    saveReviews(reviews)
    renderReviews(reviews)
    renderStats(reviews)
  }

  function renderReviews(reviews) {
    var $ul = $("#reviews-list").empty()

    if (reviews.length === 0) {
      $ul.append('<li style="color:#999;font-style:italic;">Aucun avis pour le moment. Soyez le premier !</li>')
      return
    }

    for (var i = 0; i < reviews.length && i < 20; i++) {
      var it = reviews[i]
      var stars = ""
      for (var s = 0; s < it.rating; s++) {
        stars += "★"
      }
      var extras = ""
      if (it.experience) {
        extras += "<br><em>Expérience:</em> " + escapeHtml(it.experience)
      }
      if (it.likes && it.likes.length) {
        try {
          var likesArr = $.isArray(it.likes) ? it.likes : String(it.likes).split(",")
          extras += "<br><em>Aime:</em> " + escapeHtml(likesArr.join(", "))
        } catch (e) {}
      }
      if (it.pains && it.pains.length) {
        try {
          var painsArr = $.isArray(it.pains) ? it.pains : String(it.pains).split(",")
          extras += "<br><em>Difficultés:</em> " + escapeHtml(painsArr.join(", "))
        } catch (e) {}
      }
      var li =
        "<li><strong>" +
        escapeHtml(it.name) +
        '</strong> — <span style="color:#a855f7;">' +
        stars +
        "</span> " +
        it.rating +
        "/5<br>" +
        escapeHtml(it.comment || "") +
        extras +
        "</li>"
      $ul.append(li)
    }
  }

  function renderStats(reviews) {
    var count = reviews.length
    var sum = 0,
      hist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    for (var i = 0; i < reviews.length; i++) {
      var r = Number.parseInt(reviews[i].rating, 10)
      if (!hist[r]) {
        hist[r] = 0
      }
      if (r >= 1 && r <= 5) {
        sum += r
        hist[r]++
      }
    }

    var avg = count ? (Math.round((sum / count) * 10) / 10).toFixed(1) : "0.0"
    $("#stat-count").text(count)
    $("#stat-avg").text(avg)

    var total = count || 1
    for (var k = 1; k <= 5; k++) {
      var w = Math.round((hist[k] / total) * 100)
      $("#h" + k)
        .stop()
        .animate({ width: w + "%" }, 500)
    }
  }

  function escapeHtml(s) {
    if (!s && s !== 0) {
      return ""
    }
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  function bindForm() {
    $("#review-form").submit((e) => {
      e.preventDefault()

      var name = $.trim($("#name").val())
      var rating = $("#rating").val()
      var comment = $.trim($("#comment").val())
      var experience = $("#experience").val() || ""
      var likes = $("input[name='likes']:checked")
        .map(function () {
          return this.value
        })
        .get()
      var pains = $("input[name='pains']:checked")
        .map(function () {
          return this.value
        })
        .get()
      var $msg = $("#form-msg")

      if (!name || name.length < 2) {
        $msg
          .css({ background: "#fee2e2", borderColor: "#dc2626", color: "#dc2626" })
          .text("Veuillez fournir un nom (minimum 2 caractères).")
          .fadeIn()
        return false
      }

      if (!rating) {
        $msg
          .css({ background: "#fee2e2", borderColor: "#dc2626", color: "#dc2626" })
          .text("Veuillez sélectionner une note.")
          .fadeIn()
        return false
      }

      if (!comment || comment.length < 5) {
        $msg
          .css({ background: "#fee2e2", borderColor: "#dc2626", color: "#dc2626" })
          .text("Veuillez écrire un commentaire (minimum 5 caractères).")
          .fadeIn()
        return false
      }

      var payload = {
        name: name,
        rating: rating,
        comment: comment,
        experience: experience,
        likes: (likes || []).join(","),
        pains: (pains || []).join(","),
      }

      $("#submit-btn").prop("disabled", true)
      $.post("api/save_review.php", payload)
        .done(function (resp) {
          if (resp && resp.ok) {
            fetchAndRenderReviews()
            $msg
              .css({ background: "#dcfce7", borderColor: "#16a34a", color: "#16a34a" })
              .text("✓ Merci pour votre avis !")
              .fadeIn()
            $("#review-form")[0].reset()
            $("html, body").animate({ scrollTop: $("#reviews").offset().top - 20 }, 500)
          } else {
            $msg
              .css({ background: "#fee2e2", borderColor: "#dc2626", color: "#dc2626" })
              .text("Une erreur est survenue lors de l'enregistrement.")
              .fadeIn()
          }
        })
        .fail(function () {
          $msg
            .css({ background: "#fee2e2", borderColor: "#dc2626", color: "#dc2626" })
            .text("Impossible de contacter le serveur.")
            .fadeIn()
        })
        .always(function () {
          $("#submit-btn").prop("disabled", false)
          setTimeout(() => {
            $msg.fadeOut()
          }, 5000)
        })

      return false
    })
  }

  function bindTabs() {
    $("#course-tabs .tabs-nav a").click(function (e) {
      e.preventDefault()
      var target = $(this).attr("href")

      $("#course-tabs .tabs-nav li").removeClass("active")
      $(this).parent().addClass("active")

      $("#course-tabs .tab-pane").removeClass("active").hide()
      $(target).addClass("active").fadeIn(200)
    })
  }

  function bindGallery() {
    $("#gallery .thumb").click(function () {
      var src = $(this).attr("src")
      $("#lightbox-img").attr("src", src)
      $("#lightbox").fadeIn(200)
      $("body").css("overflow", "hidden")
      return false
    })

    $("#lightbox-close").click((e) => {
      e.preventDefault()
      closeLightbox()
    })

    $(document).keyup((e) => {
      if (e.keyCode === 27) {
        closeLightbox()
      }
    })

    $("#lightbox").click(function (e) {
      if (e.target === this) {
        closeLightbox()
      }
    })
  }

  function closeLightbox() {
    $("#lightbox").fadeOut(200)
    $("body").css("overflow", "auto")
  }

  function bindSmoothScroll() {
    $('a[href^="#"]')
      .not(".tabs-nav a")
      .click(function (e) {
        var target = $(this).attr("href")

        if (target === "#") return

        var $target = $(target)
        if ($target.length) {
          e.preventDefault()

          if (windowWidth < 768) {
            $("#nav").slideUp(200)
          }

          $("html, body").animate(
            {
              scrollTop: $target.offset().top - 20,
            },
            500,
          )
        }
      })
  }

  $(() => {
    $("#burger").click((e) => {
      e.preventDefault()
      toggleMenu()
    })

    $(".nav a").click(() => {
      closeMenuOnClick()
    })

    var carousel = new Carousel($("#carousel"))

    $("#next").click((e) => {
      e.preventDefault()
      carousel.stopAutoplay()
      carousel.next()
      carousel.startAutoplay()
    })

    $("#prev").click((e) => {
      e.preventDefault()
      carousel.stopAutoplay()
      carousel.prev()
      carousel.startAutoplay()
    })

    carousel.startAutoplay()

    $("#carousel").hover(
      () => {
        carousel.stopAutoplay()
      },
      () => {
        carousel.startAutoplay()
      },
    )

    bindTabs()
    bindGallery()
    bindSmoothScroll()
    fetchAndRenderReviews()
    bindForm()

    function applyTheme(theme) {
      if (theme === "night") {
        $("body").addClass("night")
      } else {
        $("body").removeClass("night")
      }
    }

    function updateToggleIcon(theme) {
      var $btn = $("#theme-toggle")
      if (!$btn.length) return
      $btn.attr("title", theme === "night" ? "Mode jour" : "Mode nuit")
    }

    var savedTheme
    try {
      savedTheme = window.localStorage ? localStorage.getItem("theme") : null
    } catch (e) {
      savedTheme = null
    }
    var currentTheme = savedTheme === "night" ? "night" : "day"
    applyTheme(currentTheme)
    updateToggleIcon(currentTheme)

    $("#theme-toggle").click(function (e) {
      e.preventDefault()
      currentTheme = currentTheme === "night" ? "day" : "night"
      applyTheme(currentTheme)
      updateToggleIcon(currentTheme)
      try {
        if (window.localStorage) localStorage.setItem("theme", currentTheme)
      } catch (e) {}
    })

    $(window).resize(() => {
      handleResize()
    })

    $(".section").hide().fadeIn(300)
  })
})(window.jQuery)

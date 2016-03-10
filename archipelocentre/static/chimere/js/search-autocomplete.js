
var do_you_mean = "Do you mean: ";
var end_do_you_mean = "?";

var Autocomplete = function(options) {
  this.form_selector = options.form_selector;
  this.url = options.url || '/search/autocomplete/';
  this.delay = parseInt(options.delay || 300);
  this.minimum_length = parseInt(options.minimum_length || 3);
  this.form_elem = null;
  this.query_box = null;
}

Autocomplete.prototype.setup = function() {
  var self = this;

  this.form_elem = $(this.form_selector);
  this.query_box = this.form_elem.find('input[name=q]');

  // watch the input box.
  this.query_box.on('keyup', function() {
    var query = self.query_box.val();
    if (query){
        $('#haystack-search').removeAttr("disabled");
    } else {
        $('#haystack-search').attr('disabled', 'disabled');
    }

    if(query.length < self.minimum_length) {
      return false;
    }

    self.fetch(query);
  });

  // on selecting a result, populate the search field.
  this.form_elem.on('click', '.ac-result', function(ev) {
    self.query_box.val($(this).text());
    $('.ac-results').remove();
    $('#spelling').fadeOut();
    return false;
  });

  // on selecting a suggestion, populate the search field.
  $('#search-box').on('click', '.spelling-item', function(ev) {
    self.query_box.val($(this).text());
    $('.ac-results').remove();
    $('#spelling').fadeOut();
    return false;
  });
}

Autocomplete.prototype.fetch = function(query) {
  var self = this ;

  $.ajax({
    url: this.url,
    data: { 'q': query },
    success: function(data) {
      if(data.results.length){
        self.show_results(data);
      } else {
        $('.ac-results').remove();
      }
      if(data.spelling.length){
        self.show_spelling(data.spelling)
      } else {
        $("#spelling").fadeOut();
      }
      return true;
    }
  })
}

Autocomplete.prototype.show_spelling = function(spelling) {
  var text = do_you_mean;
  var base_elem = '<a href="#" class="spelling-item">'
  var end_base_elem = '</a>';
  for(var offset in spelling) {
    if (offset > 0){
      text += ", ";
    }
    text += base_elem;
    text += spelling[offset];
    text += end_base_elem;
  }
  text += end_do_you_mean;
  $("#spelling").html(text);
  $("#spelling").fadeIn();
}

Autocomplete.prototype.show_results = function(data) {
  // Remove any existing results.
  $('.ac-results').remove();

  var results = data.results || []
  var results_wrapper = $('<div class="ac-results"></div>');
  var base_elem = $('<div class="result-wrapper"><a href="#" class="ac-result"></a></div>');

  for(var res_offset in results) {
    var elem = base_elem.clone();
    // don't use .html(...) here, as it opens to XSS.
    elem.find('.ac-result').text(results[res_offset]);
    results_wrapper.append(elem);
  }

  this.query_box.after(results_wrapper)
}

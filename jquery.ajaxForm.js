define('jquery.ajaxForm', ['jquery', 'jquery.serializeForm'], function($) {

    /**
     * Custom data to be added to every AJAX form submission.
     */
    var addData = {
        ajaxRequest: true
    };

    /**
     * jQuery.ajaxForm
     * Delegates submit callbacks on the given element(s) selector, prevents the default submit, serializes the form data and submits via AJAX. Uses the form's action and method and provides a beforeSubmit callback for validation/manipulation of the form data. Adds ajax-submitting class (or what you define with the ajaxSubmittingClass option) to the form while it is submitting and removes the class on success/error.
     * @param options {Object}
     * @param options.success {Function} Called in the AJAX success callback. Called in the scope of the form element.
     * @param options.error {Function} Called in the AJAX error callback. Called in the scope of the form element.
     * @param options.beforeSubmit {Function} Called before making the AJAX request. Called in the scope of the form element. The form data is passed as the first argument. Return false to prevent the form from submitting. If you return an object it will be used instead of the original form data, so you can modify the form data however you want from your script before submitting.
     * @param options.submitOnCheck {Boolean} Whether or not so submit the form when any of its checkboxes change.
     * @param options.checkboxBoolean {Boolean|Number} Wether or not to serialize checkboxes as boolean or number (0,1) values instead of the default.
     * @param options.url {String} A custom url for the AJAX request (defaults to the form's action)
     * @param options.type {String} A custom HTTP method for the AJAX request (defaults to the form's method)
     * @param options.dataType {String} A custom dataType for the AJAX request (defaults to 'json')
     * @param options.selector {String} A jQuery selector string for the forms you want to make into AJAX forms. Pass a selector like this if you don't use one to select the elements, for example if you do something like $('#my-forms').children().ajaxForm().
     * @param options.delegate {jQuery|String} This could be any valid jQuery selected element or selector that references an element on which the submit even should be delegated. The default element is the document if nothing is provided. It's best practice to use the closest possible persistent ancestor of the forms.
     * @requires jQuery >=1.4.2
     * @requires jQuery.serializeForm If you're not using the checkboxBoolean option you can use Dan Heberden's version https://github.com/danheberden/jquery-serializeForm otherwise use this Roger Wakeman's fork which adds the checkboxBoolean option https://github.com/rgrwkmn/jquery-serializeForm
     */
    $.fn.ajaxForm = function(o) {


        if (!this.selector && !options.selector) {
            throw new Error('jQuery.ajaxForm requires a selector because it uses delegate. If you didn\t use a selector form element(s) you can pass a selector option.');
        }

        var options = {
            checkboxBoolean: true,
            ajaxSubmittingClass: 'ajax-submitting'
        };
        if (o) {
            $.extend(true, options, o);
        }

        var delegate = options.delegate || document;

        var selector = options.selector || this.selector;
        $(delegate)
            .undelegate(selector, 'submit.ajaxForm')
            .delegate(selector, 'submit.ajaxForm', function(event) {
                var $form = $(this);
                event.preventDefault();

                var data = $.extend(true, $form.serializeForm({ checkboxBoolean: options.checkboxBoolean }), addData);

                if (typeof options.beforeSubmit === 'function') {
                    var newData = options.beforeSubmit.call(this, data);
                    if (newData === false) {
                        return;
                    } else if (newData instanceof Object) {
                        data = newData;
                    }
                }

                $form.addClass(options.ajaxSubmittingClass);

                $.ajax({
                    url: $form.attr('action'),
                    type: $form.attr('method'),
                    dataType: options.dataType || 'json',
                    data: data,
                    success: function(response, textStatus, xhr) {
                        $form.removeClass(options.ajaxSubmittingClass);
                        if (typeof options.success === 'function') {
                            options.success.call($form[0], response, textStatus, xhr, data);
                        }
                    },
                    error: function(a, b, c) {
                        $form.removeClass(options.ajaxSubmittingClass);
                        if (typeof options.error === 'function') {
                            options.error.call($form[0], a, b, c);
                        }
                    }
                });
            });

        if (options.submitOnCheck) {
            var checkSelector = selector+' :checkbox';
            $(delegate)
                .undelegate(checkSelector, 'change.ajaxSubmit')
                .delegate(checkSelector, 'change.ajaxSubmit', function(event) {
                    $(this).parents('form').submit();
                });
        }

        return this;
    }

    /**
     * Show a form error. Needs some work.
     */
    $.fn.formError = function(options) {
        var message = options.message || options;

        var $form = this;
        var $error = $form.find('.form-error');
        if (!$error.length) {
            $error = $('<div class="form-error"><span class="form-error-message"></span> <input type="button" value="OK"></div>').appendTo($form);

            $error.find('input[type=button]').click(function() {
                $error.hide();
            });
        }
        $error
            .show()
            .find('.form-error-message')
            .html(message);

        return this;
    }

    /**
     * Saves the current state of the form so it can be restored later.
     */
    $.fn.saveFormState = function() {
        this.each(function() {
            var $form = $(this);
            var formState = [];
            $form.find(':input').each(function() {
                var checked = null;
                var $this = $(this);
                if ($this.is(':checkbox') || $this.is(':radio')) {
                    if ($this.is(':checked')) {
                        checked = true;
                    } else {
                        checked = false;
                    }
                }
                formState.push({
                    checked: checked,
                    element: this,
                    value: this.value
                })
            });
            this.formState = formState;
        });

        return this;
    }

    /**
     * Restore the form to its saved state.
     */
    $.fn.restoreFormState = function() {
        this.each(function() {
            var $form = $(this);
            if (!this.formState) {
                console.error('The form does not have a saved formState');
                return;
            }
            $.each(this.formState, function(i, state) {
                $(state.element).val(state.value);
                if (state.checked !== null) {
                    if (state.checked === true) {
                        $(state.element).attr('checked', 'checked');
                    } else {
                        $(state.element).removeAttr('checked');
                    }
                }
            });
        });

        return this;
    }
});
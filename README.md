# jQuery.ajaxForm
Handles any HTML Form with AJAX by serializing the form data, preventing the default form submit and making an AJAX request with the url being the form's action attribute.

Requires jQuery >=1.4.2, [my fork of jquery-serializeForm][1] if you want to use the `checkboxBoolean` option or [the original jquery-serializeForm][2] if you aren't using `checkboxBoolean`.

 ---
 
## Options
### success(response, textStatus, jqxhr, formData)
Called in the AJAX success callback. Called in the scope of the form element. Passes all three of the jQuery AJAX success arguments as well as the serialized form data that was submitted.

### error(jqxhr, textStatus, errorThrown)
Called in the AJAX error callback. Called in the scope of the form element. Passes through the three arguments from the jQuery AJAX error callback.

### beforeSubmit(formData)
Called before making the AJAX request. Called in the scope of the form element. The form data is passed as the first argument. Return false to prevent the form from submitting. If you return an object it will be used instead of the original form data, so you can modify the form data however you want from your script before submitting.

### submitOnCheck
Whether or not so submit the form when any of its checkboxes change.

### disableOnSubmit 
Whether or not to disable all of the inputs in the form while it is submitting. Defaults to `true`.

### checkboxBoolean
Wether or not to serialize checkboxes as boolean or number (0,1) values instead of the default. If set to `true` a checked/unchecked checkbox will will be `true`/`false` in the serialized data. If set to `1` a checked/unchecked checkbox will will be `1`/`0` in the serialized data. If the value evaluates to `false` the checkbox data will be serialized like a normal HTML checkbox.

### url
A custom url for the AJAX request (defaults to the form's action)

### type
A custom HTTP method for the AJAX request (defaults to the form's method)

### dataType
A custom dataType for the AJAX request (defaults to 'json')

### selector
A jQuery selector string for the forms you want to make into AJAX forms. Pass a selector like this if you don't use one to select the elements, for example if you do something like $('#my-forms').children().ajaxForm().

### delegate
This could be any valid jQuery selected element or selector that references an element on which the submit even should be delegated. The default element is the document if nothing is provided. It's best practice to use the closest possible persistent ancestor of the forms.

### ajaxSubmittingClass
The classname applied to the form while it is submitting. Defaults to `ajax-submitting`.

## Examples

### Basic Usage

```html
<form id="myFirstForm" action="/my/first/action" method="post">
    <input name="myFirstInput" value="My first value">
    <input type="submit" value="Submit">
</form>
```

``` javascript
$('#myFirstForm').ajaxForm();
```

Upon submitting the form, the data `{ myFirstInput: "My First Value" }` will be submitted to `/my/first/action` via an AJAX post request. The form will be disabled while the request is in progress.

### Success and Error callbacks
```html
<form id="myFirstForm" action="/my/first/action" method="post">
    <input name="myFirstInput" value="My first value">
    <input type="submit" value="Submit">
</form>
```

```javascript
$('#myFirstForm').ajaxForm({
    success: function(response, textStatus, jqxhr, formData) {
        console.log('server response', response);
        console.log('text status', textStatus);
        console.log('serialized form data', formData);
    },
    error: function(jqhxr, textStatus, errorText) {
        console.error('There was an error submitting the form!', errorText);
    }
});
```

I find it very handy to have the serialized form data passed through to the success callback for use in feedback such as 'The thing you submitted with the name "Your Thing Name" was submitted successfully!' 

### Validation

```html
<form id="myFirstForm" action="/my/first/action" method="post">
    <label><input name="myFirstInput" value=""> Your First Input</label>
    <input type="submit" value="Submit">
</form>
```

Validate that myFirstInput has some value.
```javascript
$('#myFirstForm').ajaxForm({
    beforeSubmit: function(formData) {
        if (!formData.myFirstInput) {
            alert('Your First Input is required!');
            return false; // cancels submission
        }
    }
});
```

Alter the serialized data and submit that instead.
```javascript
$('#myFirstForm').ajaxForm({
    beforeSubmit: function(formData) {
        if (!formData.myFirstInput) {
            formData.myFirstInput = 'Unknown';
        }
        return formData; // Submits this data
    }
});
```

You can call a separate validation method like the popular jQuery.validate. jQuery.ajaxForm does not come with any built in validation methods.

### Delegate to a close, persistent ancestor
This is recommended for performance reasons. In the absence of a `delegate` value, the document is used.

```html
<section id="allTheseForms">
    <form class="myFirstForms" action="/my/first/action" method="post">
        <input name="myInput" value="My value">
        <input type="submit" value="Submit">
    </form>
    
    <form class="myFirstForms" action="/my/second/action" method="post">
        <input name="myInput" value="My first value">
        <input type="submit" value="Submit">
    </form>
</section>
```

Using a selector string...
```javascript
$('.myFirstForms').ajaxForm({
    delegate: '#allTheseForms'
});
```

...or a jQuery selection...
```javascript
$('.myFirstForms').ajaxForm({
    delegate: $('#allTheseForms')
});
```

...or a raw element...
```javascript
$('.myFirstForms').ajaxForm({
    delegate: document.getElementById('allTheseForms')
});
```

...will result in a delegation like this:
```javascript
$('#allTheseForms')
    .undelegate('submit.ajaxForm') //prevent multiple binds
    .delegate('.myFirstForms', 'submit.ajaxForm', function() {
    // ajaxForm internals
});
```

### Checkboxes
You may have a super simple form that is essentially just a checkbox, or maybe it is a small form with a couple checkboxes and you don't want to bother the user with a separate submit button.
```html
<form id="myFirstForm" action="/my/first/action" method="post">
    <label><input type="checkbox" name="psychoMode"> Psycho Mode Enabled</label>
</form>
```

Set `submitOnCheck` to `true` so Whenever a checkbox is changed, the form will be submitted. In this case you would probably also want to set `checkboxBoolean` to `true` so that it sends either `{ psychoMode: true }` or `{ psychoMode: false }` instead of the default HTML style `{ psychoMode: 'on' }` if checked or `{}` if not checked.
```javascript
$('#myFirstForm').ajaxForm({
    submitOnCheck: true,
    checkboxBoolean: true
});
```

## jQuery.disabledForm() and jQuery.enabledForm()
jQuery.ajaxForm also comes with methods for disabled all the inputs in a form and un-disabling all the inputs in a form which it uses when `disabledOnSubmit` is `true`. You can use them in other areas of your code wherever you require jQuery.ajaxForm. jQuery.disabledForm finds all the `:input` elements in the form in question and adds the disabled attribute to them while jQuery.enableForm removes the disabled attribute making the form usable again. 

  [1]: https://github.com/rgrwkmn/jquery-serializeForm
  [2]: https://github.com/danheberden/jquery-serializeForm

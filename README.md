# SelectSearch
Lightweight plugin to easily filter and search across a select's options.

## Install
```bash
npm i @andreazorzi/selectsearch
```

## Usage
### app.js
```javascript
// SelectSearch
import SelectSearch from "@andreazorzi/selectsearch";
window.SelectSearch = SelectSearch;

// Locales
import selectsearch_it from "@andreazorzi/selectsearch/locale/it";
window.selectsearch_it = selectsearch_it;
```

### app.css
```css
@import "@andreazorzi/selectsearch/select-search.css";
```

### HTML
```html
<select id="select-search">
	<option value="1">Car</option>
	<option value="2">Bike</option>
	<option value="3">Bus</option>
	<option value="4">Plane</option>
</select>

<script>
    let select_search = new SelectSearch("#select-search", options)
</script>
```

## Options List
```
{
    lang: default_lang // an array of translated texts, default locale: it
    min_length: 0, // the minimum length to perform the search 
	list_limit: -1, // the limit of the items list
	custom_class: { // custom classes attached to the main elements
		placeholder: "",
		search_input: "",
		list_item: ""
	},
	render: (element) => { 
		return element.textContent
	},
	onSelect(element, value, text){
		
	}
}
```

## Methods
```js
// Update the list (html is a lis of options)
updateOptionsList(html, value = null)

// Open the modal
open()

// Close the modal
close()

// Get the current value
getValue()

// Set value
setValue(value)
```

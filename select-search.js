/*!
 * SelectSearch
 * https://github.com/andreazorzi/SelectSearch
 * 
 * Author: Andrea Zorzi <info@zorziandrea.com>
 * License: MIT
 * 
 * Version: 1.0.0
 */

import default_lang from "./locale/it.js";
window.default_lang = default_lang;

export default class SelectSearch{
	#container = null;
	#element = null;
	#list = {};
	#options = {
		lang: default_lang,
		custom_class: {
			placeholder: ""
		}
	}
	
	constructor(element_selector, options){
		let element = document.querySelector(element_selector);
		
		if(element == null){
			console.warn(`Element ${element_selector} not found`);
			return;
		}
		
		this.#element = element;
		this.#options = { ...this.#options, ...options };
		
		this.#init();
	}
	
	#init(){
		// Wrap element
		this.#container = document.createElement("div");
		this.#container.classList.add("select-search");
		this.#element.parentNode.insertBefore(this.#container, this.#element);
		this.#container.appendChild(this.#element);
		
		// Hide element
		this.#element.style.display = "none";
		
		// Save json list
		this.#saveJsonList();
		
		// Add search list
		this.#container.insertAdjacentHTML("beforeend", this.#getModal());
	}
	
	#saveJsonList(){
		let options = this.#element.querySelectorAll("option");
		
		for(let option of options){
			this.#list[option.value] = option.textContent;
		}
	}
	
	#getModal(){
		return `
			<input type="text" class="select-search-placeholder ${this.#options.custom_class.placeholder}" value="${this.#list[this.#element.value]}" readonly>
			<div class="select-search-modal" style="display: none;">
				<input type="text" class="select-search-input" placeholder="${this.#options.lang.search}...">
				<div class="select-search-list"></div>
			</div>
		`;
	}
}
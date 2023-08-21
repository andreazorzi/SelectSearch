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
        min_length: 0,
        list_limit: -1,
        custom_class: {
            placeholder: "",
            search_input: "",
            list_item: ""
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
        this.#container.querySelector(".select-search-modal").style.width = this.#container.querySelector(".select-search-placeholder").offsetWidth+"px";
        
        // Add event listeners
        this.#container.querySelector(".select-search-placeholder").addEventListener("click", this.open.bind(this));
        
        this.#container.querySelector(".select-search-input").addEventListener("keyup", this.#filter.bind(this));
        
        document.addEventListener("click", this.#checkOutsideClick.bind(this), false);
        
        document.addEventListener("click", this.#checkItemClick.bind(this), false);
    }
    
    #saveJsonList(){
        let options = this.#element.querySelectorAll("option");
        
        for(let option of options){
            this.#list[option.value] = option.textContent;
        }
    }
    
    #getModal(){
        return `
            <input type="text" class="select-search-placeholder ${this.#options.custom_class.placeholder}" value="${this.#list[this.getValue()]}" readonly>
            <div class="select-search-modal" style="display: none;">
                <input type="text" class="select-search-input ${this.#options.custom_class.search_input}" placeholder="${this.#options.lang.search}...">
                <div class="select-search-list"></div>
            </div>
        `;
    }
    
    #checkOutsideClick(e){
        let click_outside = true;
        
        for (var el=e.target; el && el!=this; el=el.parentNode){
            if(el === this.#container){
                click_outside = false;
            }
            
            if(el.tagName == "HTML"){
                break;
            }
        }
        
        if(click_outside){
            this.close();
        }
    }
    
    #checkItemClick(e){
        for (var el=e.target; el && el!=this; el=el.parentNode){
            if(el.matches('.select-search-item')){
                let item = el;
                
                this.#setValue(item.getAttribute("data-value"));
                this.#updatePlaceholder();
                this.#setQuery("");
                this.close();
                
                break;
            }
            else if(el.tagName == "HTML"){
                break;
            }
        }
    }
    
    #filter(){
        let query = this.#getQuery();
        this.#container.querySelector(".select-search-list").innerHTML = "";
        let counter = 0;
        
        if(query.length >= this.#options.min_length){
            for (const key in this.#list) {
                if (Object.hasOwnProperty.call(this.#list, key)) {
                    const element = this.#list[key];
                    
                    if(element.toLowerCase().includes(query.toLowerCase()) && (counter < this.#options.list_limit || this.#options.list_limit == -1)){
                        this.#container.querySelector(".select-search-list").insertAdjacentHTML("beforeend", `
                            <div class="select-search-item ${this.#options.custom_class.list_item}" data-value="${key}" ${key == this.getValue() ? "selected" : ""}>${element}</div>
                        `);
                        counter++;
                    }
                }
            }
        }
    }
    
    #getQuery(){
        return this.#container.querySelector(".select-search-input").value;
    }
    
    #setQuery(value){
        return this.#container.querySelector(".select-search-input").value = value;
    }
    
    #updatePlaceholder(){
        return this.#container.querySelector(".select-search-placeholder").value = this.#list[this.getValue()];
    }
    
    #setValue(value){
        return this.#element.value = value;
    }
    
    getValue(){
        return this.#element.value;
    }
    
    open(){
        this.#container.querySelector(".select-search-modal").style.display = "block";
        this.#container.querySelector(".select-search-input").focus();
        
        this.#filter();
    }
    
    close(){
        this.#container.querySelector(".select-search-modal").style.display = "none";
    }
}
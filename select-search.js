/*!
 * SelectSearch
 * https://github.com/andreazorzi/SelectSearch
 * 
 * Author: Andrea Zorzi <info@zorziandrea.com>
 * License: MIT
 * 
 * Version: 1.0.6
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
        display_empty: false,
        custom_class: {
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
        
        // Add search list
        this.#container.insertAdjacentHTML("beforeend", this.#getModal());
        this.#updatePlaceholder();
        this.#updateModalWidth();
        
        // Add event listeners
        this.#container.querySelector(".select-search-placeholder").addEventListener("click", this.open.bind(this));
        
        this.#container.querySelector(".select-search-input").addEventListener("keyup", this.#filter.bind(this));
        
        this.#container.querySelector(".select-search-list").addEventListener("click", this.#checkItemClick.bind(this), false);
        
        document.addEventListener("click", this.#checkOutsideClick.bind(this), false);
    }
    
    #getOptionList(){
        let options = this.#element.querySelectorAll("option");
        
        if(this.#isMultiple()){
            options = new Set([
                ...this.#element.querySelectorAll("option:checked"),
                ...this.#element.querySelectorAll("option:not(:checked)")
            ])
        }
        
        return options;
    }
    
    #getOption(key){
        let option = this.#element.querySelector(`option[value="${key}"]`);
        
        if(option == null){
            return {
                value: "---",
                html: "---",
                text: "---"
            }
        }
        
        return {
            value: option.value,
            html: this.#options.render(option),
            text: this.#options.render(option).replace(/(<([^>]+)>)/gi, "")
        };
    }
    
    #getModal(){
        return `
            <div type="text" class="select-search-placeholder ${this.#options.custom_class.placeholder}"></div>
            <div class="select-search-modal" style="display: none;">
                <input type="text" class="select-search-input ${this.#options.custom_class.search_input}" placeholder="${this.#options.lang.search}...">
                <div class="select-search-list"></div>
            </div>
        `;
    }
    
    #updateModalWidth(){
        this.#container.querySelector(".select-search-modal").style.width = this.#container.querySelector(".select-search-placeholder").offsetWidth+"px";
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
                
                if(!this.#isMultiple()){
                    this.close();
                }
                
                this.setValue(item.getAttribute("data-value"));
                
                this.#options.onSelect(item, item.getAttribute("data-value"), item.innerHTML.trim());
                
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
            for(let option of this.#getOptionList()){
                let item = this.#getOption(option.value);
                
                if(item.value == "" && !this.#options.display_empty){
                    continue;
                }
                
                if(item.text.toLowerCase().includes(query.toLowerCase()) && (counter < this.#options.list_limit || this.#options.list_limit == -1)){
                    this.#container.querySelector(".select-search-list").insertAdjacentHTML("beforeend", `
                        <div class="select-search-item ${this.#options.custom_class.list_item} ${this.#checkSelected(item.value) ? "selected" : ""}" data-value="${item.value}">
                            ${item.html}
                        </div>
                    `);
                    counter++;
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
        let value = [];
        
        this.#element.querySelectorAll('option:checked').forEach((option) => {
            value.push(this.#getOption(option.value).html);
        });
        
        this.#container.querySelector(".select-search-placeholder").innerHTML = value.length > 0 ? '<span style=" margin-right: 6px;">'+value.join(`,</span><span style=" margin-right: 6px;">`)+'</span>' : this.#getDefaultValue();
    }
    
    #isMultiple(){
        return this.#element.hasAttribute("multiple");
    }
    
    #getDefaultValue(){
        return this.#getOption("").html;
    }
    
    #checkSelected(value){
        return this.#element.querySelectorAll(`option[value="${value}"]:checked`).length > 0;
    }
    
    setValue(value){
        let item = this.#container.querySelector(`.select-search-item[data-value="${value}"]`);
        let selected = true;
        
        if(this.#isMultiple()){
            selected = item.classList.toggle("selected");
        }
        
        this.#element.querySelector(`option[value="${value}"]`).selected = selected;
        this.#updatePlaceholder();
        this.#setQuery("");
    }
    
    getValue(){
        let value = this.#element.value;
        
        if(this.#isMultiple()){
            value = [];
            
            this.#element.querySelectorAll('option:checked').forEach((option) => {
                value.push(this.#getOption(option.value).value);
            })
        }
        
        return value;
    }
    
    open(){
        this.#container.querySelector(".select-search-modal").style.display = "block";
        this.#updateModalWidth();
        this.#container.querySelector(".select-search-input").focus();
        
        this.#filter();
    }
    
    close(){
        this.#container.querySelector(".select-search-modal").style.display = "none";
    }
    
    updateOptionsList(html, value = null){
        this.#element.innerHTML = html;
        this.#filter();
        
        if(value == null){
            value = this.#container.querySelector(".select-search-list .select-search-item").getAttribute("data-value");
        }
        
        this.setValue(value);
    }
}
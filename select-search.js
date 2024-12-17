/*!
 * SelectSearch
 * https://github.com/andreazorzi/SelectSearch
 * 
 * Author: Andrea Zorzi <info@zorziandrea.com>
 * License: MIT
 * 
 * Version: 1.2.3
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
        always_display_empty: false,
        custom_class: {
            placeholder: "select-search-placeholder-style",
            search_input: "select-search-input-style",
            list_item: "select-search-item-style"
        },
        render: (element) => {
            return element.textContent
        },
        onSelect(element, value, text){
            
        }
    }
    #arrow_selection = 0;
    
    constructor(element_selector, options){
        let element = document.querySelector(element_selector);
        
        if(element == null){
            console.warn(`Element ${element_selector} not found`);
            return;
        }
        
        this.#element = element;
        let classes = { ...this.#options.custom_class, ...options.custom_class };
        this.#options = { ...this.#options, ...options };
        this.#options.custom_class = classes;
        
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
        this.#container.querySelector(".select-search-placeholder").addEventListener("click", this.toggle_open.bind(this));
        
        this.#container.querySelector(".select-search-input").addEventListener("keyup", this.#filter.bind(this));
        
        this.#container.querySelector(".select-search-input").addEventListener("keydown", this.#moveArrow.bind(this));
        
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
                text: "---",
                disabled: false
            }
        }
        
        return {
            value: option.value,
            html: this.#options.render(option),
            text: this.#options.render(option).replace(/(<([^>]+)>)/gi, ""),
            disabled: option.disabled
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
                    this.#arrow_selection = parseInt(item.getAttribute("data-id"));
                    this.close();
                }
                
                this.setValue(item.getAttribute("data-value"));
                
                break;
            }
            else if(el.tagName == "HTML"){
                break;
            }
        }
    }
    
    #moveArrow(e){
        if(e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 13){
            this.#arrow_selection = 0;
            return;
        }
        else if(e.keyCode == 13){
            this.close();
            return;
        }
        
        this.#arrow_selection = e.keyCode == 38 ? this.#arrow_selection - 1 : this.#arrow_selection + 1;
        
        if(this.#arrow_selection < 0){
            this.#arrow_selection = 0;
        }
        
        if(this.#arrow_selection >= this.#getOptionList().length){
            this.#arrow_selection = this.#getOptionList().length - 1;
        }
        
        let arrow_value = this.#container.querySelectorAll(".select-search-list .select-search-item")[this.#arrow_selection].getAttribute("data-value");
        this.setValue(arrow_value);
        
        this.#filter(null, false);
    }
    
    #filter(){
        let query = this.#getQuery();
        this.#container.querySelector(".select-search-list").innerHTML = "";
        let counter = 0;
        
        if(query.length >= this.#options.min_length){
            let html = ``;
            let current_group = null;
            for(let option of this.#getOptionList()){
                let item = this.#getOption(option.value);
                
                let group = option.parentNode.tagName.toLowerCase() == "optgroup" ? option.parentNode.getAttribute("label") : null;
                
                if((item.value == "" && !this.#options.display_empty) || item.disabled){
                    continue;
                }
                
                if(group != current_group){
                    if(current_group != null){
                        html += "</div>";
                    }
                    
                    html += `
                        <div class="select-search-optgroup">
                            ${group}
                        </div>
                        <div class="select-search-optgroup-list">
                    `;
                    
                    current_group = group;
                }
                
                if((item.text.toLowerCase().includes(query.toLowerCase()) && (counter < this.#options.list_limit || this.#options.list_limit == -1)) || (this.#options.always_display_empty && item.value == "")){
                    html += `
                        <div class="select-search-item ${this.#options.custom_class.list_item} ${this.#checkSelected(item.value) ? "selected" : ""}" data-value="${item.value}" data-id="${counter}">
                            ${item.html}
                        </div>
                    `;
                    counter++;
                }
            }
            if(current_group != null){
                html += "</div>";
            }
            
            this.#container.querySelector(".select-search-list").insertAdjacentHTML("beforeend", html);
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
        
        this.#element.querySelectorAll('option:checked:not(:disabled)').forEach((option) => {
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
    
    #scrollToViewport(element) {
        this.#container.querySelector(".select-search-modal").scrollTop = element.offsetTop - this.#container.querySelector(".select-search-modal").offsetTop;
    }
    
    setValue(value){
        let item = this.#container.querySelector(`.select-search-item[data-value="${value}"]`);
        let selected = true;
        
        this.#scrollToViewport(item)
        
        if(this.#isMultiple()){
            selected = item.classList.toggle("selected");
        }
        
        this.#element.querySelector(`option[value="${value}"]`).selected = selected;
        this.#updatePlaceholder();
        this.#setQuery("");
                
        this.#options.onSelect(item, item.getAttribute("data-value"), item.innerHTML.trim());
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
    
    toggle_open(){
        this.is_open() ? this.close() : this.open();
    }
    
    is_open(){
        return this.#container.querySelector(".select-search-modal").style.display == "block";
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
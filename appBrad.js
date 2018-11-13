//Storage Controller At last
const StorageCtrl = (function () {

    function getItemsFromLS() {
        //Hint: Content written as an JSON array will be converted into a JavaScript array.
        //in LS: data will be as follows: [{}, {}, {}]
        //and will be like this when parsing it into an array
        let items;
        if (localStorage.getItem('items')) {
            items = JSON.parse(localStorage.getItem('items'));
        } else {
            items = [];
        }
        return items;
    }

    function addItem(newItem) {
        let items = getItemsFromLS();
        items.push(newItem);
        //Throw them back to local storage
        localStorage.setItem('items', JSON.stringify(items));
    }

    

    return {
        getItemsFromLS: getItemsFromLS,

        addItem: function (newItem) {
            addItem(newItem)
        },
        
        checkForDSItems: function(items){
            //Just reassigning the values with this new DS
            localStorage.setItem('items', JSON.stringify(items));
        }



    }
})();
//Item Controller
const ItemCtrl = (function () {
    //item is an object with 3 properties
    //So make a constructor for this item 
    const Item = function (id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    };
    //data is the data structure you need 
    //for accessing items, currentItem when (EDITING) and For totalNumberOfCalories

    const data = {
        items: [],
        currentItem: null,
        totalNumberOfCalories: 0
    };

    return {

        getItems: function () {
            return data.items;
        },
        addItem: function (name, calories) {
            //Generate the ID first
            const item_id = data.items.length;
            calories = parseInt(calories);
            const new_item = new Item(item_id, name, calories);
            data.items.push(new_item);
            return new_item;
        },
        logData: function () {
            console.log(data);
        },
        getTotalCalorie: function () {
            //It actually counts totalCalories of items then set data.totalCalories = accum.
            let totalCalories = 0;
            data.items.forEach(item => {
                totalCalories += item.calories;
            });
            data.totalNumberOfCalories = totalCalories;
            return totalCalories;
        },
        setCurrentItem: function (item) {
            data.currentItem = item;
        },
        getCurrentItem: function () {
            return data.currentItem;
        },
        setItems: function (newItemsArr) {
            data.items = newItemsArr;
            // console.log(data.items);
        },
        setTotalCalories: function (newTotal) {
            data.totalNumberOfCalories = newTotal;
        }



    }
})();


//UI Controller
const UICtrl = (function () {

    return {
        //You are just gonna loop through those items and show them in the UI
        populateData: function (items) {
            const ul = document.getElementById('item-list');
            ul.innerHTML = '';
            items.forEach(item => {
                const newItem = document.createElement('li');
                newItem.classList.add('collection-item');
                newItem.id = item.id;
                newItem.innerHTML = `<strong>${item.name}:</strong> <span>${item.calories} calories
                            </span> <a href="#" class="edit_link pull-right"><i class="fa fa-pencil" 
                            style="font-size:20px"></i></a>`;
                ul.appendChild(newItem);
            });
        },
        addItem: function (item) {
            const newItem = document.createElement('li');
            newItem.classList.add('collection-item');
            newItem.id = item.id;
            newItem.innerHTML = `<strong>${item.name}:</strong> <span>${item.calories} calories
                            </span> <a href="#" class="edit_link pull-right"><i class="fa fa-pencil" 
                            style="font-size:20px"></i></a>`;
            const ul = document.getElementById('item-list');
            ul.appendChild(newItem);
            
        },
        clearFields: function () {
            document.getElementById('item_name').value = '';
            document.getElementById('numberOfCalories').value = '';
        },
        totalCalorie: function (totalCalories) {
            document.querySelector('span#totalCalories').innerHTML = totalCalories;
        },
        editState: function (visibility, addItemBtnVisibility, currentItem) {

            document.querySelector('.add-btn').style.display = addItemBtnVisibility;
            document.querySelector('.update-btn').style.display = visibility;
            document.querySelector('.delete-btn').style.display = visibility;
            document.querySelector('.back-btn').style.display = visibility;

            //Filling the fields now with the currentItem data
            //If it's there
            if (currentItem) {
                document.getElementById('item_name').value = currentItem.name;
                document.getElementById('numberOfCalories').value = currentItem.calories;
            } else {
                //If it's NOT there
                document.getElementById('item_name').value = '';
                document.getElementById('numberOfCalories').value = '';
            }
        }

    }
})();



//App Controller
const AppCtrl = (function (ItemCtrl, UICtrl, StorageCtrl) {

    const loadEventListeners = function () {

        document.querySelector('.add-btn').addEventListener('click', itemAddSubmit);

        //Event Delegation for finding edit Link, update and Back Links Delete Too
        document.querySelector('#item-list').addEventListener('click', lookForEditButton);
        document.querySelector('.card-action').addEventListener('click', lookForUpdateButton);
        document.querySelector('.card-action').addEventListener('click', lookForBackButton);

        document.querySelector('.clearAllLink').addEventListener('click', clearAllItems);
        document.querySelector('.card-action').addEventListener('click', lookForDeleteButton);
        document.addEventListener('DOMContentLoaded', displayStorageOnLoad);

    }

    function displayStorageOnLoad() {
        let items = StorageCtrl.getItemsFromLS();
        //first handle DS then UI
        ItemCtrl.setItems(items);
        UICtrl.populateData(items);
        //Reassigning totalCalorie in DS then UI
        const newTotal = ItemCtrl.getTotalCalorie(items);
        ItemCtrl.setTotalCalories(newTotal);
        UICtrl.totalCalorie(newTotal);
        
    }

    function lookForDeleteButton(e) {
        if (e.target.classList.contains('delete-btn')) {

            // Manipulating the data structure first
            //Then UI Then EditState

            const currentItem = ItemCtrl.getCurrentItem();
            //Now removing the item from the data structure
            let items = ItemCtrl.getItems();


            //Now setting the items' ids after it (id - 1)
            items.forEach((item, index) => {

                if (index > currentItem.id) {
                    item.id -= 1;

                }
            });
            items.splice(currentItem.id, 1);
            //Reassigning totalCalorie in DS then UI
            const newTotal = ItemCtrl.getTotalCalorie(items);
            ItemCtrl.setTotalCalories(newTotal);

            //Now items are gonna be mirrored to UICtrl 
            UICtrl.populateData(items);
            UICtrl.totalCalorie(newTotal);
            UICtrl.editState('none', 'block');
            //At last mirror this result to LS .. just reassigning it there
            StorageCtrl.checkForDSItems(items);
        }

    }

    function clearAllItems() {
        if (confirm("Are you sure you want to clear all items?")) {
            //Handling the data structure
            //first items
            let items = ItemCtrl.getItems();
            items = [];
            ItemCtrl.setItems(items);
            //totalCalories
            const newTotal = 0;
            ItemCtrl.setTotalCalories(newTotal);

            //NOW Handle the UI
            UICtrl.populateData(items);
            UICtrl.totalCalorie(0);
            //Now clear the LS
            localStorage.clear();
        }
    }

    function lookForBackButton(e) {

        if (e.target.classList.contains('back-btn')) {
            UICtrl.editState('none', 'block');
        }
        e.preventDefault();
    }

    function lookForEditButton(e) {

        if (e.target.parentElement.classList.contains("edit_link")) {

            //Set currentItem in the ItemCtrl to this wrapping Li item we pressed
            const selectedItemId = parseInt(e.target.parentElement.parentElement.id);
            let items = ItemCtrl.getItems();
            items.forEach(item => {
                if (item.id === selectedItemId) {
                    ItemCtrl.setCurrentItem(item);
                }
            });
            const currentItem = ItemCtrl.getCurrentItem();

            UICtrl.editState('inline', 'none', currentItem);

        }
        e.preventDefault();
    }

    function lookForUpdateButton(e) {
        if (e.target.classList.contains('update-btn')) {
            //Now grab data from the currentItem
            // update it , put it back in the item list 
            //, update the totalCalories
            //, editState in the UI
            const newEditedName = document.getElementById('item_name');
            const newEditedCalories = document.getElementById('numberOfCalories');

            const currentItem = ItemCtrl.getCurrentItem();

            currentItem.name = newEditedName.value;
            currentItem.calories = parseInt(newEditedCalories.value);
            ItemCtrl.setCurrentItem(currentItem);
            // console.log(ItemCtrl.getCurrentItem());
            let newCurrentItem = ItemCtrl.getCurrentItem();
            let items = ItemCtrl.getItems();
            items.forEach(item => {
                if (item.id === newCurrentItem.id) {
                    item = newCurrentItem;
                }
            });

            //Testing .. calling populateData in the UI for displaying data
            UICtrl.populateData(items);

            //Modifying TotalCalorie
            UICtrl.totalCalorie(ItemCtrl.getTotalCalorie());

            //Call editState 
            UICtrl.editState('none', 'block');

            //At last reassign values in the LS
            StorageCtrl.checkForDSItems(items);
        }

        e.preventDefault();

    }

    function itemAddSubmit() {

        //First Add this item data to (Data Structure) then display this new_item in UI

        const item_name = document.getElementById('item_name');
        const numberOfCalories = document.getElementById('numberOfCalories');
        if (item_name.value && numberOfCalories.value) {

            const new_item = ItemCtrl.addItem(item_name.value, numberOfCalories.value);

            UICtrl.addItem(new_item);
            UICtrl.totalCalorie(ItemCtrl.getTotalCalorie());
            UICtrl.clearFields();
            //Now add this new item to LS
            StorageCtrl.addItem(new_item);

        } else {
            console.log("Empty fields .. nothing happens in the UI");
        }
    }

    return {
        init: function () {
            //When Loading the page
            //fetching items from Data Structure First
            //DS is the COTROLLER OF THE WHOLE APP
            const items = ItemCtrl.getItems();
            //Display data in the <ul>
            UICtrl.populateData(items);
            UICtrl.totalCalorie(ItemCtrl.getTotalCalorie());
            //Load Event Listeners
            loadEventListeners();
        }

    }
})(ItemCtrl, UICtrl, StorageCtrl);
//IIFE Declaration
// const xyz = (function (x, y) {
//     console.log(x + y);
// })(4, 5);

AppCtrl.init();
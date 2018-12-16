let friendAppInit = () => {

    /* UI Elements selectors */

    const UIElements = {
        userContentWrap: '.main-content__wrap',
        inputSearch: '.user-search',
        sidebarBlock: '.main-filter',
        loadMoreButton: '.main-content__loadmore',
        allGenderRadio: '.all-filter',
        resetFilterButton: '.main-filter__reset'
    };
    const radioFilter = document.getElementsByClassName('radio-filter');

    /* Getting UI elements */

    for (let key in UIElements) {
        UIElements[key] = document.querySelector(UIElements[key]);
    }

    /* other variables */

    let pageCounter = 1;
    let usersArray = [];

    /* creating object for storing filter state each time when filtering parameters is changed */

    let filterState = {
        search: null,
        gender: null,
        sortName: null,
        sortAge: null
    };

    /* init debounce */

    let debounce = (func, wait, immediate) => {
        let timeout;
        return function () {
            let context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    };

    /* creating array of users from received data */

    let createUsersList = (data) => {
        let usersList = data.results;
        usersList.forEach(userItem => {
            usersArray.push(userItem);
        });
        return usersArray;
    };

    /* rendering array of users and appending it to wrap block */

    let renderUsersList = (data) => {
        let usersContent = "";
        UIElements.userContentWrap.innerHTML = "";

        if (data.length > 0) {

            for (let i = 0, len = data.length; i < len; i++) {
                let userItem = data[i];
                usersContent += "<div class='main-content__item'>";
                usersContent += "<figure class='content-item-thumb'><img src='"+ (userItem.picture.large ? userItem.picture.large : "") + "' alt='user-thumb'></figure>";
                usersContent += "<h3 class='content-item-name'>" + (userItem.name.first ? userItem.name.first : "") + " " + (userItem.name.last ? userItem.name.last : "") + "</h3>";
                usersContent += "<div class='content-item-age'>Age: " + (userItem.dob.age ? userItem.dob.age : "") + "</div>";
                usersContent += "<div class='content-item-phone'>Phone: " + (userItem.phone ? "<a href='tel:" + userItem.phone + "'>" + userItem.phone + "</a>" : "") + "</div>";
                usersContent += "<div class='content-item-email'>Email: " + (userItem.email ? "<a href='mailto:" + userItem.email + "'>" + userItem.email + "</a>" : "") + "</div>";
                usersContent += "<div class='content-item-location'>Location: " + (userItem.location.city ? userItem.location.city : "") + "</div>";
                usersContent += "</div>";
            }

            UIElements.userContentWrap.insertAdjacentHTML('afterbegin', usersContent);
        }

    };

    /* getting data as a promise object and then rendering it */

    let getUsers = (page = 1) => {
        fetch("https://randomuser.me/api/?nat=de&page=" + page + "&results=10")
            .then((response) => response.json())
            .then((data) => createUsersList(data))
            .then((data) => renderUsersList(data));
    };

    /* init getting data function */

    getUsers();

    /* filtering data */

    let getFilteredUsersList = (usersArray, filterState) => {

        let copyUsersArray = usersArray.slice();

        if (filterState.gender) {
            copyUsersArray = copyUsersArray.filter((userItem) => userItem.gender === filterState.gender);
        }

        if (filterState.search) {
            copyUsersArray = searchFilter(copyUsersArray, filterState.search);
        }

        if (filterState.sortName) {
            copyUsersArray = copyUsersArray.sort((a, b) => (filterState.sortName === "desc" ?  sortedArrayDESC(a.name.first, b.name.first) : sortedArrayASC(a.name.first, b.name.first)));
        }

        if (filterState.sortAge) {
            copyUsersArray = copyUsersArray.sort((a, b) => (filterState.sortAge === "desc" ?  sortedArrayDESC(a.dob.age, b.dob.age) : sortedArrayASC(a.dob.age, b.dob.age)));
        }

        return copyUsersArray;

    };

    /* checking value from search input for symbols count */

    let searchHandler = (event) => {

        let targetValue = event.target.value;
        filterState.search = targetValue;
        renderUsersList(getFilteredUsersList(usersArray, filterState));

    };

    /* filtering users array by search phrase and rendering users passed filter */

    let searchFilter = (necessaryArray, searchPhrase) => {

        let processedSearchPhrase = searchPhrase.toLowerCase();
        necessaryArray = necessaryArray.filter((userItem) => {

            return userItem.name.first.indexOf(processedSearchPhrase) !== -1 || userItem.name.last.indexOf(processedSearchPhrase) !== -1 || userItem.email.indexOf(processedSearchPhrase) !== -1

        });

        return necessaryArray;

    };

    /* init search handler with debounce function */

    UIElements.inputSearch.addEventListener('keyup', debounce(searchHandler, 2000));

    /* sorting methods */

    let sortedArrayASC = (a, b) => {
        if (a < b) return -1;
        else if (a > b) return 1;
        return 0;
    };

    let sortedArrayDESC = (a, b) => {
        if (a > b) return -1;
        else if (a < b) return 1;
        return 0;
    };


    /* change handler for filter sidebar using event delegation */

    let radioHandler = (event) => {

        if (event.target.classList.contains('age-asc-filter')) {
            filterState.sortAge = "asc";
            filterState.sortName = null;
        }
        else if (event.target.classList.contains('age-desc-filter')) {
            filterState.sortAge = "desc";
            filterState.sortName = null;
        }
        else if (event.target.classList.contains('name-asc-filter')) {
            filterState.sortName = "asc";
            filterState.sortAge = null;
        }
        else if (event.target.classList.contains('name-desc-filter')) {
            filterState.sortName = "desc";
            filterState.sortAge = null;
        }
        else if (event.target.classList.contains('all-filter')) {
            filterState.gender = "";
        }
        else if (event.target.classList.contains('men-filter')) {
            filterState.gender = "male";
        }
        else if (event.target.classList.contains('women-filter')) {
            filterState.gender = "female";
        }

        console.log(filterState)

        renderUsersList(getFilteredUsersList(usersArray, filterState));

    };

    /* resetting filter */

    let resetFilter = () => {

        UIElements.inputSearch.value = "";

        for (let i = 0, len = radioFilter.length; i < len; i++) {
            radioFilter[i].checked = false;
        }
        UIElements.allGenderRadio.checked = true;

        filterState = {
            search: null,
            gender: null,
            sortName: null,
            sortAge: null
        };

        renderUsersList(getFilteredUsersList(usersArray, filterState));

    };

    /* load the next page of users */

    let loadMoreUsers = () => {
        pageCounter++;
        getUsers(pageCounter);
    };

    UIElements.sidebarBlock.addEventListener('change', radioHandler);
    UIElements.loadMoreButton.addEventListener('click', loadMoreUsers);
    UIElements.resetFilterButton.addEventListener('click', resetFilter);

};

document.addEventListener('DOMContentLoaded', mainHandler = () => {

    /* init app */

    friendAppInit();

    /* removing unnecessary event listener */

    document.removeEventListener('DOMContentLoaded', mainHandler);

});


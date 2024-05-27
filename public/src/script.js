document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
        if (isSortingPage()) {
            markAsUninterested(currentResults[currentResultIndex]);
        }
    } else if (event.key === 'ArrowRight') {
        if (isSortingPage()) {
            markAsInterested(currentResults[currentResultIndex]);
        }
    }
});

let currentResultIndex = 0;
let currentResults = [];
let interestedItems = [];

document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();
    minimizeSearchBar();

    const keywords = document.getElementById('keywords').value;
    const cardCondition = document.getElementById('cardCondition').value;
    const listingType = document.getElementById('listingType').value;
    const negativeKeywords = document.getElementById('negativeKeywords').value;

    fetchResults(keywords, cardCondition, listingType, negativeKeywords);
});

function fetchResults(keywords, cardCondition, listingType, negativeKeywords) {
    const query = {
        keywords: keywords,
        cardCondition: cardCondition,
        listingType: listingType,
        negativeKeywords: negativeKeywords
    };

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            currentResults = data.results;
            currentResultIndex = 0;
            displayNextCard();
        })
        .catch(error => {
            console.error('Error fetching data from eBay:', error);
            alert('Error fetching data. Please try again later.');
        });
}

function displayNextCard() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    if (currentResults.length > currentResultIndex) {
        const result = currentResults[currentResultIndex];
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = result.image.imageUrl;
        img.alt = result.title;

        const title = document.createElement('h3');
        title.textContent = result.title;

        const price = document.createElement('p');
        price.textContent = `Price: ${result.price.value} ${result.price.currency}`;

        const link = document.createElement('a');
        link.href = result.itemWebUrl;
        link.target = '_blank';
        link.textContent = 'View on eBay';
        link.style.color = '#8e44ad'; // Change link color to purple

        const interestedButton = document.createElement('button');
        interestedButton.textContent = 'Interested';
        interestedButton.onclick = () => markAsInterested(result);

        const uninterestedButton = document.createElement('button');
        uninterestedButton.textContent = 'Uninterested';
        uninterestedButton.onclick = () => markAsUninterested(result);

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(link);
        card.appendChild(interestedButton);
        card.appendChild(uninterestedButton);

        resultsContainer.appendChild(card);
    }

    showSideImages(true);
}

function markAsInterested(item) {
    animateCard('right');
    setTimeout(() => {
        interestedItems.push(item);
        console.log('Marked as interested:', item);
        currentResultIndex++;
        displayNextCard();
    }, 500); // Delay to allow animation to complete
}

function markAsUninterested(item) {
    animateCard('left');
    setTimeout(() => {
        console.log('Marked as uninterested:', item);
        currentResultIndex++;
        displayNextCard();
    }, 500); // Delay to allow animation to complete
}

function animateCard(direction) {
    const card = document.querySelector('.card');
    if (card) {
        card.style.transition = 'transform 0.5s, opacity 0.5s';
        card.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        card.style.opacity = '0';
    }
}

function minimizeSearchBar() {
    const searchBar = document.getElementById('searchForm');
    searchBar.style.display = 'none';

    const searchIcon = document.getElementById('searchIcon');
    searchIcon.style.display = 'block';
}

function maximizeSearchBar() {
    const searchBar = document.getElementById('searchForm');
    searchBar.style.display = 'block';

    const searchIcon = document.getElementById('searchIcon');
    searchIcon.style.display = 'none';
}

document.getElementById('searchIcon').addEventListener('click', maximizeSearchBar);

function toggleInterestedView() {
    const resultsContainer = document.getElementById('resultsContainer');
    const interestedItemsContainer = document.getElementById('interestedItemsContainer');

    if (resultsContainer.style.display === 'none') {
        resultsContainer.style.display = 'block';
        interestedItemsContainer.style.display = 'none';
    } else {
        resultsContainer.style.display = 'none';
        interestedItemsContainer.style.display = 'block';
        displayInterestedItems();
    }

    showSideImages(resultsContainer.style.display === 'block'); // Show/hide side images
}

function displayInterestedItems() {
    const interestedItemsContainer = document.getElementById('interestedItemsContainer');
    interestedItemsContainer.innerHTML = '';

    interestedItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = item.image.imageUrl;
        img.alt = item.title;

        const title = document.createElement('h3');
        title.textContent = item.title;

        const price = document.createElement('p');
        price.textContent = `Price: ${item.price.value} ${item.price.currency}`;

        const link = document.createElement('a');
        link.href = item.itemWebUrl;
        link.target = '_blank';
        link.textContent = 'View on eBay';
        link.style.color = '#8e44ad'; // Change link color to purple

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeFromInterested(item);

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(link);
        card.appendChild(removeButton);

        interestedItemsContainer.appendChild(card);
    });
}

function removeFromInterested(item) {
    interestedItems = interestedItems.filter(i => i.itemId !== item.itemId);
    displayInterestedItems();
}

function getInterestedItems() {
    return interestedItems;
}

function isSortingPage() {
    const resultsContainer = document.getElementById('resultsContainer');
    return resultsContainer.style.display !== 'none';
}

function showSideImages(show) {
    const sideImages = document.querySelectorAll('.side-image, .side-text');
    sideImages.forEach(image => {
        image.style.display = show ? 'block' : 'none';
    });
}

document.getElementById('viewInterestedItems').addEventListener('click', toggleInterestedView);

document.addEventListener("DOMContentLoaded", function () {
    const pages = ["main-page", "login-page", "sign-up-page", "forget-password-page", "forget-code-insert-page", "code-insert-page", "refresh-password-page", "Landing-page","account-container"];
    
    function navigateTo(page) {
        sessionStorage.setItem('location',page);
        if (sessionStorage.getItem('location')==='Landing-page') {
            fetchProfileData(sessionStorage.getItem('email'));
            fetchFriendsData(sessionStorage.getItem('email'),true);
            document.querySelector('.user-list').addEventListener('click', handleUserClick);
            document.getElementById("addFriendForm").addEventListener("submit", addFriend);
            username = sessionStorage.getItem('email') || ''; 
            recipient = sessionStorage.getItem('recipient') || ''; 
            joinChat();
        }else if (sessionStorage.getItem('location')==='account-container') {   
            fetchProfileDataAccount();
            document.getElementById('editProfileButton').addEventListener('click', () => {
            document.getElementById('editModal').style.display = 'flex';
            });
            document.getElementById('closeModalButton').addEventListener('click', () => {
            document.getElementById('editModal').style.display = 'none';
            });
            document.getElementById('saveChangesButton').addEventListener('click', saveProfileData);
            document.getElementById('updateImage').addEventListener('change', handleFileUpload);
        
        }
        pages.forEach(p => {
            document.querySelector(`.${p}`).style.display = (p === page) ? "flex" : "none";
        });
    }

    if (sessionStorage.getItem('location')) {
        navigateTo(sessionStorage.getItem('location'));
    }else {
        navigateTo("main-page");
    }


    window.navigateTo = navigateTo;
});

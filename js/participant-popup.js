document.addEventListener('DOMContentLoaded', function() {
  // Create modal container once
  const modal = document.createElement('div');
  modal.className = 'faculty-modal';
  modal.innerHTML = `
    <div class="faculty-modal-content">
      <span class="faculty-modal-close">&times;</span>
      <div class="faculty-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const modalBody = modal.querySelector('.faculty-modal-body');
  const closeBtn = modal.querySelector('.faculty-modal-close');
  
  // Add modal styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .faculty-modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.7);
    }
    
    .faculty-modal-content {
      position: relative;
      background-color: #fefefe;
      margin: 10% auto;
      padding: 20px;
      border-radius: 8px;
      width: 70%;
      max-width: 800px;
      animation: modalFadeIn 0.3s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    
    @keyframes modalFadeIn {
      from {opacity: 0; transform: translateY(-20px);}
      to {opacity: 1; transform: translateY(0);}
    }
    
    .faculty-modal-close {
      position: absolute;
      right: 15px;
      top: 10px;
      color: #aaa;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }
    
    .faculty-modal-close:hover {
      color: #000;
    }
    
    .faculty-modal-body {
      padding: 10px 0;
    }
    
    .faculty-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .faculty-header img {
      max-width: 200px;
      border-radius: 8px;
      margin-bottom: 15px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    /* Hover effect for grid items */
    .quarto-listing-container-grid .quarto-grid-item {
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }
    
    .quarto-listing-container-grid .quarto-grid-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(styleSheet);
  
  // Close modal when clicking the X
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Find all faculty grid items
  const facultyLinks = document.querySelectorAll('.quarto-listing-container-grid a[href*=".html"]');
  
  facultyLinks.forEach(function(link) {
    link.addEventListener('click', async function(e) {
      e.preventDefault(); // Prevent navigation
      
      try {
        // Get the href
        const url = link.getAttribute('href');
        
        // Extract essential info from the current card
        const name = link.querySelector('.listing-title')?.textContent || '';
        const affiliation = link.querySelector('.listing-subtitle')?.textContent || '';
        const image = link.querySelector('img')?.src || '';
        const category = link.querySelector('.listing-category')?.textContent || '';
        
        // Create header with faculty image
        const facultyHeader = `
          <div class="faculty-header">
            <img src="${image}" alt="${name}">
            <h2>${name}</h2>
            <p>${affiliation}</p>
            <p><strong>${category}</strong></p>
          </div>
          <hr>
        `;
        
        // Show a loading message with the header
        modalBody.innerHTML = facultyHeader + '<div style="text-align:center;padding:30px;">Loading additional information...</div>';
        modal.style.display = 'block';
        
        // Try to fetch the full profile
        try {
          const response = await fetch(url);
          const html = await response.text();
          
          // Parse the HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Extract the main content
          const content = doc.querySelector('main') || doc.querySelector('article');
          
          if (content) {
            // Create a temporary container
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content.innerHTML;
            
            // Remove the logos section (targeting common containers that might contain it)
            const logosSection = tempDiv.querySelector('img[src*="CEMA"], img[src*="Swiss"], img[src*="AMM"]')?.closest('div');
            if (logosSection) {
              logosSection.remove();
            }
            
            // Remove any horizontal lines at the bottom that may be related to the logos section
            const horizontalLines = tempDiv.querySelectorAll('hr');
            if (horizontalLines.length > 0) {
              // Remove the last horizontal line if it might be before the logos
              horizontalLines[horizontalLines.length - 1].remove();
            }
            
            // Add the header to the cleaned content
            modalBody.innerHTML = facultyHeader + tempDiv.innerHTML;
          } else {
            // If we can't find more content, just keep the header we already displayed
            modalBody.innerHTML = facultyHeader + `
              <div style="text-align:center;padding:10px;">
                <p>No additional information available.</p>
              </div>
            `;
          }
        } catch (fetchError) {
          // If fetch fails, we already have the basic info displayed
          console.error('Error fetching profile details:', fetchError);
        }
      } catch (error) {
        console.error('Error showing faculty modal:', error);
      }
    });
  });
});
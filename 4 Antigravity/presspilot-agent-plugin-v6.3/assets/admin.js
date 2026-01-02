/**
 * PressPilot Admin JavaScript
 * Handle form submission and site generation
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        
        // Logo upload handling
        $('#logo-upload-area').on('click', function() {
            $('#business_logo').click();
        });
        
        $('#business_logo').on('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#logo-preview').attr('src', e.target.result).show();
                    $('.upload-placeholder').hide();
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Drag and drop handling
        $('#logo-upload-area').on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('dragover');
        });
        
        $('#logo-upload-area').on('dragleave', function(e) {
            e.preventDefault();
            $(this).removeClass('dragover');
        });
        
        $('#logo-upload-area').on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('dragover');
            
            const files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                $('#business_logo')[0].files = files;
                $('#business_logo').trigger('change');
            }
        });
        
        // Form submission
        $('#presspilot-form').on('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const businessName = $('#business_name').val();
            const businessTagline = $('#business_tagline').val();
            const businessDescription = $('#business_description').val();
            const contentLanguage = $('#content_language').val();
            const businessType = $('#business_type').val();
            const logoFile = $('#business_logo')[0].files[0];
            
            // Validation
            if (!businessName || !businessDescription || !businessType || !logoFile) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Show progress
            $('#presspilot-form').hide();
            $('#generation-progress').show();
            $('.presspilot-wrap').addClass('loading');
            
            // Simulate progress stages
            simulateProgress();
            
            // Upload logo first
            uploadLogo(logoFile, function(logoUrl) {
                // Generate site
                generateSite(businessName, businessTagline, businessDescription, contentLanguage, businessType, logoUrl);
            });
        });
        
        /**
         * Upload logo to WordPress media library
         */
        function uploadLogo(file, callback) {
            updateProgress(20, 'Uploading logo...');
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('action', 'presspilot_upload_logo');
            formData.append('nonce', presspilot_ajax.nonce);
            
            $.ajax({
                url: presspilot_ajax.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) {
                        callback(response.data.url);
                    } else {
                        showError('Logo upload failed: ' + response.data.message);
                    }
                },
                error: function() {
                    showError('Logo upload failed. Please try again.');
                }
            });
        }
        
        /**
         * Generate site with AI
         */
        function generateSite(businessName, businessTagline, businessDescription, contentLanguage, businessType, logoUrl) {
            updateProgress(40, 'Analyzing your logo colors...');
            
            setTimeout(function() {
                updateProgress(60, 'Generating website content with AI...');
            }, 2000);
            
            setTimeout(function() {
                updateProgress(80, 'Creating WordPress pages...');
            }, 4000);
            
            $.ajax({
                url: presspilot_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'presspilot_generate',
                    nonce: presspilot_ajax.nonce,
                    business_name: businessName,
                    business_tagline: businessTagline,
                    business_description: businessDescription,
                    content_language: contentLanguage,
                    business_type: businessType,
                    logo_url: logoUrl
                },
                success: function(response) {
                    if (response.success) {
                        updateProgress(100, 'Complete! 🎉');
                        setTimeout(function() {
                            showResults(response.data);
                        }, 500);
                    } else {
                        showError('Generation failed: ' + response.data.message);
                    }
                },
                error: function(xhr, status, error) {
                    showError('Generation failed: ' + error);
                }
            });
        }
        
        /**
         * Update progress bar
         */
        function updateProgress(percent, message) {
            $('#progress-fill').css('width', percent + '%');
            $('#progress-text').text(message);
        }
        
        /**
         * Simulate progress for better UX
         */
        function simulateProgress() {
            let progress = 0;
            const interval = setInterval(function() {
                progress += Math.random() * 10;
                if (progress > 90) {
                    clearInterval(interval);
                    progress = 90;
                }
                $('#progress-fill').css('width', progress + '%');
            }, 1000);
        }
        
        /**
         * Show results
         */
        function showResults(data) {
            $('#generation-progress').hide();
            $('#generation-results').show();
            
            let html = '<div class="results-summary">';
            html += '<p><strong>Business Name:</strong> ' + data.business_name + '</p>';
            html += '<p><strong>Theme Selected:</strong> ' + data.theme.name + '</p>';
            html += '<p><strong>Pages Created:</strong></p>';
            html += '<ul class="page-list">';
            
            $.each(data.pages, function(key, page) {
                html += '<li>';
                html += '<strong>' + page.title + '</strong> ';
                html += '<span>';
                html += '<a href="' + page.edit_url + '" target="_blank">Edit</a> | ';
                html += '<a href="' + page.url + '" target="_blank">Preview</a>';
                html += '</span>';
                html += '</li>';
            });
            
            html += '</ul>';
            html += '<h3>✅ What Was Created:</h3>';
            html += '<ul>';
            html += '<li>✅ All 5 pages published and live</li>';
            html += '<li>✅ Navigation menu created automatically</li>';
            html += '<li>✅ Pages arranged in proper order</li>';
            html += '<li>✅ Home page set as front page</li>';
            html += '</ul>';
            html += '<h3>Next Steps (Optional):</h3>';
            html += '<ol>';
            html += '<li>Install the recommended theme: ' + data.theme.name + '</li>';
            html += '<li>Customize colors in Appearance > Customize</li>';
            html += '<li>Edit pages to add your real business details</li>';
            html += '<li>Add contact forms, phone numbers, addresses</li>';
            html += '</ol>';
            html += '<p><a href="' + data.preview_url + '" target="_blank" class="button button-primary">Preview Your Site</a></p>';
            html += '</div>';
            
            $('#results-content').html(html);
        }
        
        /**
         * Show error message
         */
        function showError(message) {
            $('#generation-progress').hide();
            $('.presspilot-wrap').removeClass('loading');
            alert('Error: ' + message);
            $('#presspilot-form').show();
        }
    });
    
})(jQuery);
/**
 * PressPilot Agent Bridge - Frontend JavaScript
 * Handles connection testing and bridge communication
 */

(function($) {
    'use strict';
    
    const PressPilotAgentBridge = {
        
        init: function() {
            this.bindEvents();
            this.testConnection();
        },
        
        bindEvents: function() {
            // Add bridge status indicator to admin bar if present
            if ($('#wp-admin-bar-presspilot').length) {
                this.addStatusIndicator();
            }
            
            // Test connection button if present
            $(document).on('click', '.presspilot-test-connection', this.testConnection.bind(this));
        },
        
        addStatusIndicator: function() {
            const $adminBarItem = $('#wp-admin-bar-presspilot');
            if ($adminBarItem.length) {
                $adminBarItem.append('<span class="presspilot-agent-status" title="Agent Bridge Status">🤖</span>');
            }
        },
        
        testConnection: function() {
            const self = this;
            
            // Show loading state
            $('.presspilot-agent-status').text('⏳');
            
            // Test REST API endpoint
            $.ajax({
                url: presspilot_bridge.rest_url + 'health',
                method: 'GET',
                headers: {
                    'X-WP-Nonce': presspilot_bridge.nonce
                },
                timeout: 10000
            })
            .done(function(response) {
                self.handleConnectionSuccess(response);
            })
            .fail(function(xhr, status, error) {
                self.handleConnectionError(xhr, status, error);
            });
        },
        
        handleConnectionSuccess: function(response) {
            console.log('PressPilot Agent Bridge: Connection successful', response);
            
            // Update status indicator
            $('.presspilot-agent-status').text('✅').attr('title', 'Agent Bridge: Connected');
            
            // Store bridge info
            this.bridgeInfo = response;
            
            // Add meta tag for SaaS detection
            if (!$('meta[name="presspilot-agent-bridge"]').length) {
                $('head').append('<meta name="presspilot-agent-bridge" content="connected" />');
            }
            
            // Trigger custom event
            $(document).trigger('presspilot:bridge:connected', [response]);
        },
        
        handleConnectionError: function(xhr, status, error) {
            console.warn('PressPilot Agent Bridge: Connection failed', {
                status: status,
                error: error,
                response: xhr.responseText
            });
            
            // Update status indicator
            $('.presspilot-agent-status').text('❌').attr('title', 'Agent Bridge: Connection Failed');
            
            // Trigger custom event
            $(document).trigger('presspilot:bridge:error', [xhr, status, error]);
        },
        
        // Make MCP call (for testing purposes)
        callTool: function(toolName, parameters) {
            return $.ajax({
                url: presspilot_bridge.rest_url + 'mcp',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': presspilot_bridge.nonce
                },
                data: JSON.stringify({
                    tool: toolName,
                    parameters: parameters,
                    requestId: 'test_' + Date.now()
                })
            });
        },
        
        // Get available tools
        getAvailableTools: function() {
            return $.ajax({
                url: presspilot_bridge.rest_url + 'tools',
                method: 'GET',
                headers: {
                    'X-WP-Nonce': presspilot_bridge.nonce
                }
            });
        }
    };
    
    // Initialize when document is ready
    $(document).ready(function() {
        PressPilotAgentBridge.init();
    });
    
    // Make available globally for testing
    window.PressPilotAgentBridge = PressPilotAgentBridge;
    
})(jQuery);
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';

// PayPal sandbox client ID (replace with your own from developer.paypal.com)
const PAYPAL_CLIENT_ID = 'AamsGWBz4AjDYCd2EEj2z_qYxIvLQfritPn-8vfyYwzk8sMuZZd6hDEcJQ5UUOpIpC_nR4E3goq5mnLP'; // TODO: Replace with your PayPal sandbox client ID

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something Went Wrong</Text>
          <Text style={styles.disclaimerText}>
            An error occurred: {this.state.error?.toString()}
          </Text>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.payButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const PaymentContent = React.memo(function PaymentContent() {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewError, setWebViewError] = useState(null);
  const [htmlMode, setHtmlMode] = useState('paypal'); // paypal, minimal, static
  const [useDataUrl, setUseDataUrl] = useState(true); // Default to data URL
  const [webViewKey, setWebViewKey] = useState(0); // For forcing WebView remount

  // Static HTML for basic WebView test
  const staticHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <h1>Static Test</h1>
        <p>WebView loaded successfully</p>
        <script>
          window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'log', message: 'Static HTML loaded' }));
        </script>
      </body>
    </html>
  `;

  // Minimal HTML for testing WebView interactivity
  const minimalHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          button { padding: 10px 20px; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>Test WebView</h1>
        <button onclick="window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'test', message: 'Button clicked' }))">Click Me</button>
        <script>
          window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'log', message: 'Minimal HTML loaded' }));
        </script>
      </body>
    </html>
  `;

  // PayPal HTML for checkout
  const paypalHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://*.paypal.com https://*.paypalobjects.com; script-src 'self' 'unsafe-inline' https://*.paypal.com https://*.paypalobjects.com; connect-src 'self' https://*.paypal.com; style-src 'self' 'unsafe-inline';">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          .loading { margin-top: 20px; font-size: 16px; color: #666; }
          .error { color: red; margin-top: 20px; }
          #paypal-button-container { min-height: 100px; background-color: #f0f0f0; }
        </style>
        <script
          src="https://www.sandbox.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD"
          onerror="window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'error', message: 'Failed to load PayPal SDK script: ' + (event.error || 'Unknown error') }));"
        ></script>
      </head>
      <body>
        <div id="paypal-button-container"></div>
        <div id="loading-message" class="loading">Loading PayPal Checkout...</div>
        <div id="error-message" class="error"></div>
        <script>
          function postMessage(status, message, extra = {}) {
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({ status, message, ...extra }));
            } catch (e) {
              console.error('postMessage error: ' + e.message);
            }
          }

          function log(message) {
            console.log(message);
            postMessage('log', message);
          }

          log('PayPal SDK script included');

          // Simplified PayPal SDK check with timeout
          function waitForPaypal() {
            return new Promise((resolve, reject) => {
              const startTime = Date.now();
              const maxWait = 30000; // 30 seconds
              function check() {
                if (window.paypal) {
                  log('PayPal SDK loaded successfully');
                  resolve(window.paypal);
                } else if (Date.now() - startTime > maxWait) {
                  const error = 'PayPal SDK failed to load after ' + maxWait + 'ms';
                  log(error);
                  document.getElementById('error-message').innerText = 'Error: Unable to load payment interface';
                  postMessage('error', error);
                  reject(new Error(error));
                } else {
                  log('Checking PayPal SDK...');
                  setTimeout(check, 200);
                }
              }
              check();
            });
          }

          // Render PayPal buttons
          window.onload = async function() {
            try {
              postMessage('dom', document.body.innerHTML);
              const paypal = await waitForPaypal();
              log('Rendering PayPal buttons...');
              paypal.Buttons({
                style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
                onClick: (data, actions) => {
                  log('PayPal button clicked: ' + JSON.stringify(data));
                  return actions.resolve();
                },
                createOrder: (data, actions) => {
                  log('Creating PayPal order');
                  document.getElementById('loading-message').innerText = 'Creating order...';
                  return actions.order.create({
                    purchase_units: [{
                      amount: { value: '10.00', currency_code: 'USD' }
                    }],
                    application_context: { shipping_preference: 'NO_SHIPPING' }
                  }).catch(err => {
                    log('Create order error: ' + err.message);
                    throw err;
                  });
                },
                onApprove: (data, actions) => {
                  log('Payment approved: ' + JSON.stringify(data));
                  document.getElementById('loading-message').innerText = 'Capturing payment...';
                  return actions.order.capture().then(details => {
                    log('Payment captured: ' + JSON.stringify(details));
                    postMessage('success', 'Payment completed', { orderID: data.orderID });
                  }).catch(err => {
                    log('Capture error: ' + err.message);
                    throw err;
                  });
                },
                onError: (err) => {
                  log('PayPal SDK error: ' + (err.message || 'Unknown error'));
                  document.getElementById('error-message').innerText = 'Error: ' + (err.message || 'Payment failed');
                  postMessage('error', err.message || 'Payment failed');
                }
              }).render('#paypal-button-container').then(() => {
                log('PayPal buttons rendered successfully');
                document.getElementById('loading-message').style.display = 'none';
                postMessage('buttons_rendered', 'PayPal buttons rendered');
                postMessage('container', document.getElementById('paypal-button-container').innerHTML);
              }).catch(err => {
                log('Button render error: ' + err.message);
                document.getElementById('error-message').innerText = 'Error: Failed to render buttons';
                postMessage('error', 'Failed to render buttons: ' + err.message);
              });
            } catch (err) {
              log('RenderButtons error: ' + err.message);
              document.getElementById('error-message').innerText = 'Error: ' + err.message;
              postMessage('error', err.message);
            }
          };
        </script>
      </body>
    </html>
  `;

  // Base64-encoded data URLs
  const staticDataUrl = `data:text/html;base64,${btoa(staticHtml)}`;
  const minimalDataUrl = `data:text/html;base64,${btoa(minimalHtml)}`;
  const paypalDataUrl = `data:text/html;base64,${btoa(paypalHtml)}`;

  // Handle payment initiation
  const handlePayment = async () => {
    console.log('handlePayment called with selectedMethod:', selectedMethod);
    if (selectedMethod === 'card' || selectedMethod === 'googlepay' || selectedMethod === 'applepay') {
      if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'YOUR_SANDBOX_CLIENT_ID') {
        Alert.alert('Error', 'Invalid PayPal Client ID. Please configure a valid sandbox client ID.');
        return;
      }
      console.log('Setting showWebView and loading to true...');
      setShowWebView(true);
      setLoading(true);
      setWebViewError(null);
      setWebViewKey(prev => prev + 1); // Force WebView remount
    } else {
      // Mock payment for PayMe/Alipay
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Payment Successful',
          'This is a test payment and no actual charges were made.',
          [
            {
              text: 'OK',
              onPress: () => router.push({pathname: '/reservation/payment',}),
            },
          ],
        );
      }, 1000);
    }
  };

  // Handle WebView messages
  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    console.log('Raw WebView message:', event.nativeEvent.data);
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Parsed WebView message:', data);
      if (data.status === 'buttons_rendered') {
        setLoading(false);
      } else if (data.status === 'log') {
        console.log('WebView log:', data.message);
      } else if (data.status === 'dom') {
        console.log('WebView DOM content:', data.message);
      } else if (data.status === 'container') {
        console.log('PayPal button container content:', data.message);
      } else if (data.status === 'test') {
        console.log('Test button clicked:', data.message);
        Alert.alert('Test', 'Test button clicked successfully!');
      } else if (data.status === 'success') {
        setLoading(false);
        setShowWebView(false);
        Alert.alert(
          'Payment Successful',
          `Test payment completed. Order ID: ${data.orderID}`,
          [
            {
              text: 'OK',
              onPress: () => router.push({pathname: '/reservation/payment',}),
            },
          ],
        );
      } else if (data.status === 'error') {
        setLoading(false);
        setShowWebView(false);
        Alert.alert('Payment Error', data.message || 'An error occurred during payment.', [
          { text: 'OK' },
        ]);
      }
    } catch (err) {
      console.error('WebView message parse error:', err);
      Alert.alert('Error', 'Failed to process payment response.');
      setShowWebView(false);
      setLoading(false);
    }
  };

  // Handle WebView errors
  const handleWebViewError = (syntheticEvent: { nativeEvent: any }) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    let errorMessage = 'Failed to load checkout: Unknown error';
    if (nativeEvent.code === 'NETWORK_ERROR') {
      errorMessage = 'Network error: Please check your internet connection, try a different network, or retry later.';
    } else if (nativeEvent.description) {
      errorMessage = `Failed to load checkout: ${nativeEvent.description}`;
    }
    setWebViewError(errorMessage);
    setLoading(false);
  };

  // Timeout for WebView loading
  useEffect(() => {
    if (showWebView && loading) {
      const timeout = setTimeout(() => {
        if (loading) {
          setWebViewError('Checkout took too long to load. Please check your connection, try a different network, or retry later.');
          setShowWebView(false);
          setLoading(false);
        }
      }, 10000); // 10-second timeout
      return () => clearTimeout(timeout);
    }
  }, [showWebView, loading]);

  // Cancel WebView loading
  const handleCancel = () => {
    setShowWebView(false);
    setLoading(false);
    setWebViewError(null);
  };

  // Fallback to browser
  const handleBrowserFallback = async () => {
    const fallbackUrl = 'https://www.sandbox.paypal.com/checkoutnow?client-id=' + PAYPAL_CLIENT_ID;
    try {
      const supported = await Linking.canOpenURL(fallbackUrl);
      if (supported) {
        await Linking.openURL(fallbackUrl);
      } else {
        Alert.alert('Error', 'Unable to open browser for payment.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open browser: ' + err.message);
    }
  };

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <View style={styles.cardContainer}>
            <Text style={styles.testCardText}>
              Test Card: 4111 1111 1111 1111 | Exp: Any future date | CVC: Any 3 digits
            </Text>
          </View>
        );
      case 'googlepay':
      case 'applepay':
        return (
          <View style={styles.cardContainer}>
            <Text style={styles.testCardText}>
              Simulated {selectedMethod.toUpperCase()} payment. Uses PayPal card checkout for demo.
            </Text>
          </View>
        );
      case 'payme':
      case 'alipay':
        return (
          <View style={styles.mockWalletContainer}>
            <Text style={styles.mockWalletText}>
              This is a simulated {selectedMethod.toUpperCase()} interface for demonstration purposes.
            </Text>
            <Text style={styles.mockWalletSubtext}>
              In a production app, this would integrate with the native {selectedMethod} SDK.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (webViewError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Payment Error</Text>
        <Text style={styles.disclaimerText}>{webViewError}</Text>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => {
            setWebViewError(null);
            setHtmlMode('static');
            setUseDataUrl(true);
            handlePayment();
          }}
        >
          <Text style={styles.payButtonText}>Retry with Static HTML (Data URL)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => {
            setWebViewError(null);
            setHtmlMode('minimal');
            setUseDataUrl(true);
            handlePayment();
          }}
        >
          <Text style={styles.payButtonText}>Retry with Minimal HTML (Data URL)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => {
            setWebViewError(null);
            setHtmlMode('paypal');
            setUseDataUrl(true);
            handlePayment();
          }}
        >
          <Text style={styles.payButtonText}>Retry with PayPal HTML (Data URL)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => {
            setWebViewError(null);
            setHtmlMode('paypal');
            setUseDataUrl(false);
            handlePayment();
          }}
        >
          <Text style={styles.payButtonText}>Retry with PayPal HTML (Inline)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handleBrowserFallback}
        >
          <Text style={styles.payButtonText}>Open PayPal in Browser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showWebView) {
    const htmlSource = htmlMode === 'static' ? staticHtml : htmlMode === 'minimal' ? minimalHtml : paypalHtml;
    const dataUrl = htmlMode === 'static' ? staticDataUrl : htmlMode === 'minimal' ? minimalDataUrl : paypalDataUrl;
    const webViewSource = useDataUrl ? { uri: dataUrl } : { html: htmlSource };
    console.log('WebView source:', useDataUrl ? `Data URL ${htmlMode}` : `Inline HTML ${htmlMode}`);
    console.log('HTML length:', useDataUrl ? dataUrl.length : htmlSource.length);
    return (
      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF4444" />
            <Text style={styles.loadingText}>
              Loading {htmlMode === 'static' ? 'Static' : htmlMode === 'minimal' ? 'Test' : 'PayPal'} Checkout...
            </Text>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        <WebView
          key={webViewKey}
          source={webViewSource}
          onMessage={handleWebViewMessage}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          onLoadStart={() => console.log('WebView loading started')}
          onLoad={() => console.log('WebView loaded successfully')}
          onLoadProgress={({ nativeEvent }) =>
            console.log('WebView progress:', nativeEvent.progress, 'url:', nativeEvent.url)
          }
          onNavigationStateChange={navState => console.log('WebView navigation state:', navState)}
          onShouldStartLoadWithRequest={request => {
            console.log('WebView navigation request:', request.url);
            if (request.url === 'about:blank') {
              console.log('Allowing about:blank navigation');
              return true;
            }
            if (request.url.includes('paypal.com')) {
              console.log('Allowing PayPal navigation:', request.url);
              return true;
            }
            return true;
          }}
          onLoadEnd={event => {
            console.log('WebView loading ended:', event.nativeEvent);
            if (event.nativeEvent.url === 'about:blank' && !event.nativeEvent.loading) {
              console.error('WebView stuck on about:blank, possible HTML error');
              setWebViewError('Failed to load checkout: Unable to render interface. Please retry or check your network.');
              setLoading(false);
            }
          }}
          onRenderProcessGone={syntheticEvent => {
            console.error('WebView render process crashed:', syntheticEvent.nativeEvent);
            setWebViewError('WebView crashed. Please retry or try a different device.');
            setLoading(false);
          }}
          onContentProcessDidTerminate={syntheticEvent => {
            console.error('WebView content process terminated:', syntheticEvent.nativeEvent);
            setWebViewError('WebView process terminated. Please retry or try a different device.');
            setLoading(false);
          }}
          onConsoleMessage={event => {
            console.log('WebView console:', event.nativeEvent.message);
          }}
          injectedJavaScript={`
            console.log('Injected JavaScript running');
            document.body.style.border = '2px solid blue';
            window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'log', message: 'Injected JavaScript running' }));
            window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'dom', message: document.body ? document.body.innerHTML : 'No body' }));
            setTimeout(() => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'container', message: document.getElementById('paypal-button-container') ? document.getElementById('paypal-button-container').innerHTML : 'No container found' }));
            }, 5000);
            true;
          `}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[styles.paymentOption, selectedMethod === 'card' && styles.selectedOption]}
          onPress={() => setSelectedMethod('card')}
        >
          <Text style={styles.paymentOptionText}>Credit Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, selectedMethod === 'googlepay' && styles.selectedOption]}
          onPress={() => setSelectedMethod('googlepay')}
        >
          <Text style={styles.paymentOptionText}>Google Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, selectedMethod === 'applepay' && styles.selectedOption]}
          onPress={() => setSelectedMethod('applepay')}
        >
          <Text style={styles.paymentOptionText}>Apple Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, selectedMethod === 'payme' && styles.selectedOption]}
          onPress={() => setSelectedMethod('payme')}
        >
          <Text style={styles.paymentOptionText}>PayMe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, selectedMethod === 'alipay' && styles.selectedOption]}
          onPress={() => setSelectedMethod('alipay')}
        >
          <Text style={styles.paymentOptionText}>Alipay</Text>
        </TouchableOpacity>
      </View>

      {renderPaymentMethod()}

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? 'Processing...' : 'Pay Now (Test Mode)'}
        </Text>
      </TouchableOpacity>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          This is a demonstration app. No actual payment will be processed.
        </Text>
      </View>
    </ScrollView>
  );
});

export default function PaymentScreen() {
  return (
    <ErrorBoundary>
      <PaymentContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentOption: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#FF4444',
    backgroundColor: '#FEE1DE',
  },
  paymentOptionText: {
    fontSize: 16,
  },
  cardContainer: {
    marginBottom: 24,
  },
  testCardText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  mockWalletContainer: {
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  mockWalletText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  mockWalletSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  payButtonDisabled: {
    backgroundColor: '#FF8888',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
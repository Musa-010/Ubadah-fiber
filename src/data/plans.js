const plans = [
  {
    name: 'Basic Plan',
    price: 'Rs. 3,000',
    period: 'Polo 6+4 = 10MB',
    featured: false,
    ribbon: null,
    dataPlan: 'Basic 6MB Plan',
    optionValue: 'polo-10mb',
    features: [
      { bold: 'Package:', text: ' Polo 6+4 = 10MB' },
      { bold: 'Monthly Bill:', text: ' Rs. 3,000' },
      { bold: 'Installation:', text: ' Rs. 7,500' },
      { bold: 'Total Amount:', text: ' Rs. 10,500' },
    ],
    btnText: 'Choose Basic',
  },
  {
    name: 'Standard Plan',
    price: 'Rs. 3,248',
    period: 'Super 6 MB or Super 8 MB',
    featured: true,
    ribbon: 'MOST POPULAR',
    dataPlan: 'Standard 6MB Plan',
    optionValue: 'super-6mb',
    features: [
      { bold: 'Option 1:', text: ' Super 6 MB' },
      { bold: null, text: 'Monthly: Rs. 3,248 | Total: Rs. 10,748' },
      { bold: 'Option 2:', text: ' Super 8 MB' },
      { bold: null, text: 'Monthly: Rs. 3,800 | Total: Rs. 11,300' },
      { bold: 'Installation:', text: ' Rs. 7,500' },
    ],
    btnText: 'Choose Standard',
  },
  {
    name: 'Premium Plan',
    price: 'Rs. 4,300',
    period: 'Super 10 MB or Super 12 MB',
    featured: false,
    ribbon: null,
    dataPlan: 'Premium 12MB Plan',
    optionValue: 'super-12mb',
    features: [
      { bold: 'Option 1:', text: ' Super 10 MB' },
      { bold: null, text: 'Monthly: Rs. 4,300 | Total: Rs. 11,800' },
      { bold: 'Option 2:', text: ' Super 12 MB' },
      { bold: null, text: 'Monthly: Rs. 4,610 | Total: Rs. 12,110' },
      { bold: 'Installation:', text: ' Rs. 7,500' },
    ],
    btnText: 'Choose Premium',
  },
];

export default plans;

export const estimateValue = (originalPrice: number, yearOfManufacture: number, vehicleType: 'motorbike' | 'car'): number => {
  if (!originalPrice || !yearOfManufacture) return 0;

  const currentYear = new Date().getFullYear();
  const age = Math.max(1, currentYear - yearOfManufacture + 1);
  
  let depreciationRate = 0;

  if (vehicleType === 'motorbike') {
    // Xe máy khấu hao khoảng 15% mỗi năm, tối đa 70%
    depreciationRate = Math.min(0.7, age * 0.15);
  } else {
    // Ô tô khấu hao khoảng 10% mỗi năm trong 3 năm đầu, sau đó 7-8%, tối đa 80%
    if (age <= 3) {
      depreciationRate = age * 0.1;
    } else {
      depreciationRate = Math.min(0.8, 0.3 + (age - 3) * 0.08);
    }
  }

  const remainingValue = originalPrice * (1 - depreciationRate);
  
  // Làm tròn đến hàng trăm nghìn
  return Math.round(remainingValue / 100000) * 100000;
};

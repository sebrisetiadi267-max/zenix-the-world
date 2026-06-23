document.addEventListener("DOMContentLoaded", function () {

const fareForm = document.getElementById("fareForm");
const vehicleInput = document.getElementById("vehicle");
const tripTypeInput = document.getElementById("tripType");
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const pickupInput = document.getElementById("pickup");
const destinationInput = document.getElementById("destination");
const pickupDateInput = document.getElementById("pickupDate");
const pickupTimeInput = document.getElementById("pickupTime");
const distanceInput = document.getElementById("distance");
const durationInput = document.getElementById("duration");
const tollInput = document.getElementById("toll");
const additionalInput = document.getElementById("additional");

const routeResult = document.getElementById("routeResult");
const resultCustomerName = document.getElementById("resultCustomerName");
const resultCustomerPhone = document.getElementById("resultCustomerPhone");
const resultVehicle = document.getElementById("resultVehicle");
const resultTripType = document.getElementById("resultTripType");
const resultPickupDate = document.getElementById("resultPickupDate");
const resultPickupTime = document.getElementById("resultPickupTime");
const resultBase = document.getElementById("resultBase");
const resultDistance = document.getElementById("resultDistance");
const resultDuration = document.getElementById("resultDuration");
const resultToll = document.getElementById("resultToll");
const resultAdditional = document.getElementById("resultAdditional");
const resultTripAdjustment = document.getElementById("resultTripAdjustment");
const resultRounding = document.getElementById("resultRounding");
const finalFare = document.getElementById("finalFare");

const whatsappButton = document.getElementById("whatsappButton");
const printButton = document.getElementById("printButton");
const resetButton = document.getElementById("resetButton");

let latestTripData = null;

/* =========================
   VEHICLE DATA (FIX RUSH OK)
========================= */
const vehicleRates = {
    reborn: {
        name: "Innova Reborn",
        baseFare: 50000,
        pricePerKm: 6000,
        pricePerMinute: 1300
    },
    zenix: {
        name: "Innova Zenix",
        baseFare: 65000,
        pricePerKm: 7000,
        pricePerMinute: 1500
    },
    rush: {
        name: "Toyota Rush",
        baseFare: 45000,
        pricePerKm: 5500,
        pricePerMinute: 1200
    }
};

/* =========================
   UTIL
========================= */
const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(num);

const roundUp10k = (n) => Math.ceil(n / 10000) * 10000;

/* =========================
   RESET UI
========================= */
function resetUI() {
    routeResult.textContent = "Lokasi jemput → Tujuan";
    resultCustomerName.textContent = "Belum diisi";
    resultCustomerPhone.textContent = "Belum diisi";
    resultVehicle.textContent = "Belum dipilih";
    resultTripType.textContent = "Sekali Jalan";
    resultPickupDate.textContent = "Belum diisi";
    resultPickupTime.textContent = "Belum diisi";
    resultBase.textContent = "Rp0";
    resultDistance.textContent = "Rp0";
    resultDuration.textContent = "Rp0";
    resultToll.textContent = "Rp0";
    resultAdditional.textContent = "Rp0";
    resultTripAdjustment.textContent = "Rp0";
    resultRounding.textContent = "Rp0";
    finalFare.textContent = "Rp0";
}

/* =========================
   SUBMIT
========================= */
fareForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const vehicleKey = vehicleInput.value;

    // FIX ERROR VALIDASI RUSH
    const vehicle = vehicleRates[vehicleKey];

    if (!vehicle) {
        alert("Jenis kendaraan tidak valid: " + vehicleKey);
        return;
    }

    const name = customerNameInput.value.trim();
    const phone = customerPhoneInput.value.trim();
    const pickup = pickupInput.value.trim();
    const destination = destinationInput.value.trim();

    const distance = Number(distanceInput.value);
    const duration = Number(durationInput.value);
    const toll = Number(tollInput.value || 0);
    const additional = Number(additionalInput.value || 0);

    if (!name || !phone || !pickup || !destination) {
        alert("Semua data wajib diisi");
        return;
    }

    const distanceCost = distance * vehicle.pricePerKm;
    const durationCost = duration * vehicle.pricePerMinute;

    const subtotal =
        vehicle.baseFare +
        distanceCost +
        durationCost +
        toll +
        additional;

    let tripAdjustment = 0;
    let tripTypeName = tripTypeInput.value;

    if (tripTypeInput.value === "roundTrip") {
        tripTypeName = "Pulang Pergi";
        tripAdjustment = subtotal * 0.5;
    } else {
        tripTypeName = "Sekali Jalan";
    }

    const total = roundUp10k(subtotal + tripAdjustment);

    // OUTPUT
    resultCustomerName.textContent = name;
    resultCustomerPhone.textContent = phone;
    resultVehicle.textContent = vehicle.name;
    resultTripType.textContent = tripTypeName;

    resultDistance.textContent = formatRupiah(distanceCost);
    resultDuration.textContent = formatRupiah(durationCost);
    resultToll.textContent = formatRupiah(toll);
    resultAdditional.textContent = formatRupiah(additional);
    resultTripAdjustment.textContent = formatRupiah(tripAdjustment);
    resultRounding.textContent = formatRupiah(total);

    finalFare.textContent = formatRupiah(total);

    latestTripData = { name, phone, vehicle: vehicle.name, total };
});

/* =========================
   RESET
========================= */
resetButton.addEventListener("click", function () {
    fareForm.reset();
    latestTripData = null;
    resetUI();
});

/* =========================
   PRINT
========================= */
printButton.addEventListener("click", function () {
    if (!latestTripData) return alert("Hitung dulu!");
    window.print();
});

});

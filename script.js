// Mengambil elemen formulir
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

// Mengambil elemen hasil
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
const resultTripAdjustment = document.getElementById(
    "resultTripAdjustment"
);
const resultRounding = document.getElementById("resultRounding");
const finalFare = document.getElementById("finalFare");
const whatsappButton = document.getElementById("whatsappButton");
const printButton = document.getElementById("printButton");
const resetButton = document.getElementById("resetButton");
// Menyimpan hasil perhitungan terakhir
let latestTripData = null;

// Tarif kendaraan
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
    }
};

// Format angka menjadi rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}

// Format tanggal Indonesia
function formatTanggalIndonesia(dateValue) {
    const date = new Date(dateValue + "T00:00:00");

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

// Pembulatan ke atas Rp10.000
function roundUpTenThousand(number) {
    return Math.ceil(number / 10000) * 10000;
}

// Mengubah nomor WhatsApp menjadi format internasional
function normalizeWhatsAppNumber(phoneNumber) {
    let phone = phoneNumber.replace(/\D/g, "");

    if (phone.startsWith("0")) {
        phone = "62" + phone.slice(1);
    }

    return phone;
}

// Menampilkan pesan kesalahan
function showError(message, inputElement) {
    finalFare.textContent = message;

    if (inputElement) {
        inputElement.focus();
    }
}

// Tombol WhatsApp dinonaktifkan sebelum tarif dihitung
whatsappButton.disabled = true;

// Proses perhitungan tarif
fareForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Menghapus data perhitungan lama
    latestTripData = null;
    whatsappButton.disabled = true;

    // Mengambil nilai formulir
    const selectedVehicle = vehicleInput.value;
    const selectedTripType = tripTypeInput.value;
    const vehicle = vehicleRates[selectedVehicle];

    const customerName = customerNameInput.value.trim();
    const customerPhone = customerPhoneInput.value.trim();
    const pickup = pickupInput.value.trim();
    const destination = destinationInput.value.trim();
    const pickupDate = pickupDateInput.value;
    const pickupTime = pickupTimeInput.value;

    const distance = Number(distanceInput.value);
    const duration = Number(durationInput.value);
    const toll = Number(tollInput.value) || 0;
    const additional = Number(additionalInput.value) || 0;

    const phoneNumbersOnly = customerPhone.replace(/\D/g, "");

    // Validasi nama pelanggan
    if (customerName === "") {
        showError(
            "Nama pelanggan harus diisi",
            customerNameInput
        );

        return;
    }

    // Validasi nomor WhatsApp
    if (
        phoneNumbersOnly.length < 10 ||
        phoneNumbersOnly.length > 15
    ) {
        showError(
            "Nomor WhatsApp harus berisi 10 sampai 15 angka",
            customerPhoneInput
        );

        return;
    }

    // Validasi lokasi jemput
    if (pickup === "") {
        showError(
            "Lokasi jemput harus diisi",
            pickupInput
        );

        return;
    }

    // Validasi tujuan
    if (destination === "") {
        showError(
            "Tujuan perjalanan harus diisi",
            destinationInput
        );

        return;
    }

    // Validasi tanggal
    if (pickupDate === "") {
        showError(
            "Tanggal penjemputan harus diisi",
            pickupDateInput
        );

        return;
    }

    // Validasi waktu penjemputan
    if (pickupTime === "") {
        showError(
            "Waktu penjemputan harus diisi",
            pickupTimeInput
        );

        return;
    }

    // Validasi jarak
    if (distance <= 0) {
        showError(
            "Jarak harus lebih dari 0 KM",
            distanceInput
        );

        return;
    }

    // Validasi waktu perjalanan
    if (duration <= 0) {
        showError(
            "Waktu perjalanan harus lebih dari 0 menit",
            durationInput
        );

        return;
    }

    // Validasi biaya tol
    if (toll < 0) {
        showError(
            "Biaya tol tidak boleh kurang dari 0",
            tollInput
        );

        return;
    }

    // Validasi biaya tambahan
    if (additional < 0) {
        showError(
            "Biaya tambahan tidak boleh kurang dari 0",
            additionalInput
        );

        return;
    }

    // Menghitung biaya
    const distanceCost =
        distance * vehicle.pricePerKm;

    const durationCost =
        duration * vehicle.pricePerMinute;

    const subtotal =
        vehicle.baseFare +
        distanceCost +
        durationCost +
        toll +
        additional;

    // Jenis perjalanan
    let tripTypeName = "Sekali Jalan";
    let tripAdjustment = 0;

    if (selectedTripType === "roundTrip") {
        tripTypeName = "Pulang Pergi";
        tripAdjustment = subtotal * 0.5;
    }

    // Menghitung total dan pembulatan
    const totalBeforeRounding =
        subtotal + tripAdjustment;

    const totalFare =
        roundUpTenThousand(totalBeforeRounding);

    const roundingAdjustment =
        totalFare - totalBeforeRounding;

    const formattedPickupDate =
        formatTanggalIndonesia(pickupDate);

    // Menampilkan hasil
    routeResult.textContent =
        pickup + " → " + destination;

    resultCustomerName.textContent =
        customerName;

    resultCustomerPhone.textContent =
        customerPhone;

    resultVehicle.textContent =
        vehicle.name;

    resultTripType.textContent =
        tripTypeName;

    resultPickupDate.textContent =
        formattedPickupDate;

    resultPickupTime.textContent =
        pickupTime + " WIB";

    resultBase.textContent =
        formatRupiah(vehicle.baseFare);

    resultDistance.textContent =
        formatRupiah(distanceCost);

    resultDuration.textContent =
        formatRupiah(durationCost);

    resultToll.textContent =
        formatRupiah(toll);

    resultAdditional.textContent =
        formatRupiah(additional);

    resultTripAdjustment.textContent =
        formatRupiah(tripAdjustment);

    resultRounding.textContent =
        formatRupiah(roundingAdjustment);

    finalFare.textContent =
        formatRupiah(totalFare);

    // Menyimpan data untuk WhatsApp
    latestTripData = {
        customerName: customerName,
        customerPhone: customerPhone,
        pickup: pickup,
        destination: destination,
        vehicleName: vehicle.name,
        tripTypeName: tripTypeName,
        pickupDate: formattedPickupDate,
        pickupTime: pickupTime,
        distance: distance,
        duration: duration,
        baseFare: vehicle.baseFare,
        distanceCost: distanceCost,
        durationCost: durationCost,
        toll: toll,
        additional: additional,
        tripAdjustment: tripAdjustment,
        roundingAdjustment: roundingAdjustment,
        totalFare: totalFare
    };

    // Mengaktifkan tombol WhatsApp
    whatsappButton.disabled = false;
    printButton.disabled = false;
});

// Mengirim rincian melalui WhatsApp
whatsappButton.addEventListener("click", function () {
    if (latestTripData === null) {
        alert("Hitung tarif terlebih dahulu.");
        return;
    }

    const phoneNumber =
        normalizeWhatsAppNumber(
            latestTripData.customerPhone
        );

    const message =
`Halo ${latestTripData.customerName},

Berikut rincian perjalanan Anda:

Kendaraan: ${latestTripData.vehicleName}
Jenis perjalanan: ${latestTripData.tripTypeName}
Rute: ${latestTripData.pickup} → ${latestTripData.destination}
Tanggal penjemputan: ${latestTripData.pickupDate}
Waktu penjemputan: ${latestTripData.pickupTime} WIB
Jarak perjalanan: ${latestTripData.distance} KM
Waktu perjalanan: ${latestTripData.duration} menit

Tarif dasar: ${formatRupiah(latestTripData.baseFare)}
Biaya jarak: ${formatRupiah(latestTripData.distanceCost)}
Biaya waktu: ${formatRupiah(latestTripData.durationCost)}
Biaya tol: ${formatRupiah(latestTripData.toll)}
Biaya tambahan: ${formatRupiah(latestTripData.additional)}
Penyesuaian perjalanan: ${formatRupiah(latestTripData.tripAdjustment)}
Pembulatan: ${formatRupiah(latestTripData.roundingAdjustment)}

Total tarif: ${formatRupiah(latestTripData.totalFare)}

Terima kasih telah menggunakan layanan Zenix The World.`;

    const whatsappUrl =
        "https://wa.me/" +
        phoneNumber +
        "?text=" +
        encodeURIComponent(message);

    window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
    );
});
```javascript
resetButton.addEventListener("click", function () {
    // Mengosongkan seluruh formulir
    fareForm.reset();

    // Menghapus data perjalanan terakhir
    latestTripData = null;

    // Mengembalikan tampilan hasil ke kondisi awal
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

    // Menonaktifkan kembali tombol WhatsApp
    whatsappButton.disabled = true;

    // Mengembalikan nilai biaya menjadi 0
    tollInput.value = 0;
    additionalInput.value = 0;

    // Mengarahkan kursor ke nama pelanggan
    customerNameInput.focus();
});
```
whatsappButton.addEventListener("click", function () {
    // kode WhatsApp
});

resetButton.addEventListener("click", function () {
    // kode reset
});

printButton.addEventListener("click", function () {
    if (latestTripData === null) {
        alert("Hitung tarif terlebih dahulu.");
        return;
    }

    window.print();
});
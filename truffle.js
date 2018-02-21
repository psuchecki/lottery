module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 7545,
            network_id: "*" // Match any network id
        },
        kovan: {
            host: "localhost",
            port: 8544,
            network_id: "42",
            from: "0x00218204AE73580613f9f2962fe8591a2D2dDFCD"
        }
    },
};

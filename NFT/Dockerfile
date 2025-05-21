FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Preinstall tools and set up environment
RUN apt-get update && apt-get install -y \
    curl git build-essential pkg-config libssl-dev \
    ca-certificates clang cmake protobuf-compiler unzip

# Install Rust (cached separately)
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Clone and build only Sui CLI, not full node or validator
RUN git clone --depth 1 --branch devnet https://github.com/MystenLabs/sui.git /sui
WORKDIR /sui
RUN cargo build --release -p sui

# Add just the CLI binary
RUN cp /sui/target/release/sui /usr/local/bin/sui
ENV PATH="/usr/local/bin:$PATH"

# Check install
RUN sui --version

# Set working dir for your Move smart contract
WORKDIR /app
COPY . .

CMD ["bash"]

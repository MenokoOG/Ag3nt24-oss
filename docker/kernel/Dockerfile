# Ag3nt24 kernel container — the boundary ACL (ADR-0023, ADR-0025).
#
# The four COBOL gates are built here from kernel/*.cbl at image build, exactly
# as they are on Windows, and the conformance suite runs as the image test. An
# image that cannot reproduce the pinned verdicts does not get built.
#
# GnuCOBOL is compiled from the 3.2.0 release rather than taken from the Debian
# archive, which does not carry 3.2.0. ADR-0021 pins the compiler version and
# says plainly that a different compiler is a different experiment. ADR-0025
# then makes this image the second build platform and requires 5/5 match on
# both. Taking a distro package would change the OS and the compiler at once,
# and the "passes on both platforms" claim would be measuring two things. This
# costs image size and build time, and it buys a comparison that means what it
# says.

# ---------------------------------------------------------------------------
# Stage 1: build GnuCOBOL 3.2.0
# ---------------------------------------------------------------------------
FROM debian:bookworm-slim AS cobol

ARG GNUCOBOL_VERSION=3.2

# Set once the first verified build reports it, then the build fails on any
# change to the tarball. Left empty deliberately rather than filled with a
# guess: a checksum nobody has observed is worse than no checksum, because it
# looks like verification and is not.
ARG GNUCOBOL_SHA256=

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      ca-certificates \
      curl \
      xz-utils \
      libdb-dev \
      libgmp-dev \
      libncurses-dev \
      libxml2-dev \
      libcjson-dev \
      gettext \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp/build

# The tarball is fetched from the GNU archive. The checksum is verified rather
# than trusted, because the compiler is the one tool whose identity this whole
# phase depends on.
RUN curl -fsSL -o gnucobol.tar.xz \
      "https://ftp.gnu.org/gnu/gnucobol/gnucobol-${GNUCOBOL_VERSION}.tar.xz" \
    && OBSERVED="$(sha256sum gnucobol.tar.xz | cut -d' ' -f1)" \
    && echo "gnucobol-${GNUCOBOL_VERSION}.tar.xz sha256: ${OBSERVED}" \
    && if [ -n "${GNUCOBOL_SHA256}" ] && [ "${OBSERVED}" != "${GNUCOBOL_SHA256}" ]; then \
         echo "checksum mismatch: expected ${GNUCOBOL_SHA256}"; exit 1; \
       fi \
    && tar -xf gnucobol.tar.xz \
    && cd "gnucobol-${GNUCOBOL_VERSION}" \
    && ./configure --prefix=/opt/gnucobol \
    && make -j"$(nproc)" \
    && make install \
    && cd / && rm -rf /tmp/build

# ---------------------------------------------------------------------------
# Stage 2: gates, bridges, shim
# ---------------------------------------------------------------------------
FROM node:24-bookworm-slim AS kernel

ENV DEBIAN_FRONTEND=noninteractive

# Runtime libraries the compiled gates and libcob link against. Without these a
# gate fails to START, and a gate that does not start returns no verdict — the
# failure mode ADR-0021 spends twenty lines of preflight preventing, because a
# missing verdict read as a DENY is a lie about what the boundary decided.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libdb5.3 \
      libgmp10 \
      libncurses6 \
      libxml2 \
      libcjson1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=cobol /opt/gnucobol /opt/gnucobol

ENV PATH="/opt/gnucobol/bin:${PATH}" \
    LD_LIBRARY_PATH="/opt/gnucobol/lib" \
    COB_CONFIG_DIR="/opt/gnucobol/share/gnucobol/config" \
    COB_COPY_DIR="/opt/gnucobol/share/gnucobol/copy"

WORKDIR /app

# Only what the kernel needs. The archive comes along because the conformance
# suite runs the five carried scenarios out of it; it is read, never edited.
COPY package.json ./
COPY kernel/ ./kernel/
COPY bridge/ ./bridge/
COPY scripts/ ./scripts/
COPY conformance/ ./conformance/
COPY prior-art/a24-v1/scenarios/ ./prior-art/a24-v1/scenarios/
COPY prior-art/a24-v1/tkd-24/ ./prior-art/a24-v1/tkd-24/

# Build the gates from unmodified source, then prove them. The conformance run
# is the image test: it regenerates the rotation tables from the kernel, runs
# the five scenarios, checks the 24 registry slots and resolves the day-20260112
# table into ITF patterns. A changed verdict fails the build here rather than
# shipping an image nobody checked.
RUN node scripts/build-kernel.js \
    && node conformance/run.js

EXPOSE 8024

ENV KERNEL_PORT=8024 \
    KERNEL_HOST=0.0.0.0 \
    NODE_ENV=production

# No curl in the image; Node is already here and speaks HTTP.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.KERNEL_PORT||8024)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# The gates hold no state and write no receipt, so nothing here needs to be
# root. ADR-0023 makes this a machine gate, not a privileged one.
USER node

CMD ["node", "bridge/shim.js"]

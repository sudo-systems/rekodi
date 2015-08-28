#!/bin/bash

rm -f /usr/bin/rekodi || true
rm -f /usr/share/applications/rekodi-ia32.desktop || true

ln -s /usr/share/rekodi-linux-ia32/rekodi /usr/bin/rekodi
cp /usr/share/rekodi-linux-ia32/resources/app/assets/linux/rekodi-ia32.desktop /usr/share/applications/

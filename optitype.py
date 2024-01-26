# https://github.com/FRED-2/OptiType

"""
Requeriments:
- Samtools (ya se instalo anteriormente, pero asegurarse de instarlo en /usr/bin )
   para esto al hacer ./configure, no definimos el lugar de instalacion:
   ./configure
    make
    make install

- sudo apt-get build-dep hdf5

- Razers3: https://github.com/seqan/seqan/tree/main/apps/razers3
    1)  git clone https://github.com/seqan/seqan.git
    2)  mkdir seqan/build; cd seqan/build
    3)  cmake .. -DCMAKE_BUILD_TYPE=Release
    4)  make razers3
    5)  ./bin/razers3 --help

Se puede instalr en un ambiente o en el base de anaconda.
pip install numpy
pip install pyomo
pip install pysam
pip install matplotlib

pip install tables
pip install pandas
pip install future

conda install -c conda-forge glpk

"""

import os
import sys

cmd = f"python /home/vicente/biotools/OptiType/OptiTypePipeline.py -i ./test/rna/rnaseq-sample1_1.fastq ./test/rna/rnaseq-sample1_2.fastq --rna -v -o   ./test/rna"

os.system(cmd)